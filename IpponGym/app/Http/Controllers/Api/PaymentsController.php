<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Socios;
use Illuminate\Http\Request;
use PHPMailer\PHPMailer\SMTP;
use Illuminate\Support\Facades\DB;
use PHPMailer\PHPMailer\PHPMailer;
use App\Http\Controllers\Controller;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

class PaymentsController extends Controller {
    /**
     * Function to delete individual payments
     */
    public function deletePayments(Request $request) {
        try {
            $socio = Socios::find($request->_id);
            foreach($socio->payments as $payment) {
                if ($request->interval == $payment['interval']) {
                    $socio->pull('payments', $payment);
                    return [
                        'status' => 'success',
                        'message' => 'El pago se ha borrado',
                        'data' => $socio,
                    ];
                }
            }
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al generar el nuevo pago. Código de error: BePaCo@DePa',
                'status' => 'danger',
                'title' => 'Registro de nuevo pago',
                'trace' => 'Error al generar el nuevo pago. Código de error: BePaCo@DePa. Detalle del servidor: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Function that register all the payments of the socios via monthly schedule
     */
    public static function monthlyPayments() {
        /* Get the active customers */
        $customers = DB::collection('customers')->where('active', true)->get();
        // $customers = DB::collection('Personas')->where('active', true)->get();
        $newPayment = [];
        $date = new \MongoDB\BSON\UTCDateTime(new \DateTime('now'));

        $filename = date('Y_m_d_H-i-s') . '_Remesa_.csv';
        $csvoutput = fopen($filename, 'w');
        $csvData = [];
        foreach ($customers as $customer) {
            $auxPaymentData = $customer['paymentData'];
            /* Check if for the looped customercustomer we have a payment for the current month-year */
            $alreadyGenerated = false;
            foreach ($customer['payments'] as $payment) {
                if ($payment['interval'] == date('Y-m')) {
                    $alreadyGenerated = true;
                    /* Store the existing payment */
                    $newPayment = $payment;
                }
            }
            /* If doesn't exists a payment registered for this month we create and save it on the customer based on the last payments attributes, here we create all the non manual created monthly payments, later treat the inbank payments to generate the csv bank data */
            if (!$alreadyGenerated) {
                $newPayment['rate'] = $auxPaymentData['rate'];
                $newPayment['amount'] = $auxPaymentData['amount'];
                $newPayment['paymenttype'] = $auxPaymentData['paymenttype'];
                $newPayment['iban'] = $auxPaymentData['iban'];
                $newPayment['ibanownername'] = $auxPaymentData['ibanownername'];
                $newPayment['ibanownerdni'] = $auxPaymentData['ibanownerdni'];
                $newPayment['interval'] = date('Y-m');
                $newPayment['status'] = 'Pendiente';
                $newPayment['dategenerated'] = $date;
                $newPayment['dateconfirmed'] = null;
                $auxCustomer = Socios::find($customer['_id']);
                $auxCustomer->push('payments', $newPayment);
                $auxCustomer->save();
                /* Manage utf8 characters */
                fprintf($csvoutput, chr(0xEF).chr(0xBB).chr(0xBF));
            }
            /* We need to add to the array of the csv data only the inbank payments */
            if (strcmp($newPayment['paymenttype'], 'Domiciliación') === 0) {
                /* If the payment is already generated and its status is pending we need to send it to the bank, the already generated and no pending will be ignored because there are already managed too */
                if ($alreadyGenerated && strcmp($newPayment['status'], 'Pendiente') === 0) {
                    /* Search on newPayment array which on $alreadyGenerated stores the existing payment */
                    $searchIban = array_search($newPayment['iban'], array_column($csvData, 'iban'));
                    /* If don't find the iban on the current csv data, add the already generated payment data to the csv data */
                    if ($searchIban === false) {
                        array_push($csvData, ['name' => $newPayment['ibanownername'], 'dni' => $newPayment['ibanownerdni'], 'iban' => $newPayment['iban'], 'amount' => $newPayment['amount'], 'interval' => $newPayment['interval']]);
                    /* If the iban exists on the current csv data, sum the amounts */
                    } else {
                        /* Sum operation, use the iban on the newPayment and csvData to find the index */
                        (float)$csvData[array_search($newPayment['iban'], array_column($csvData, 'iban'))]['amount'] += (float)$auxPaymentData['amount'];
                        // (float)$csvData[array_search($newPayment['ibanownerdni'], array_column($csvData, 'dni'))]['amount'] += (float)$auxPaymentData['amount'];
                    }
                /* If the payment isn't generated */
                } else if (!$alreadyGenerated) {
                    /* Search the payment data saved on the customer profile to determine if exists on the csvData */
                    $searchIban = array_search($auxPaymentData['iban'], array_column($csvData, 'iban'));
                    /* If don't find the iban on the current csv data, add the new payment data to the csv data */
                    if (!$searchIban) {
                        /* If the iban exists on the current csv data, sum the amounts */
                        array_push($csvData, ['name' => $auxPaymentData['ibanownername'], 'dni' => $auxPaymentData['ibanownerdni'], 'iban' => $auxPaymentData['iban'], 'amount' => $auxPaymentData['amount'], 'interval' => $newPayment['interval']]);
                    } else {
                        /* Sum operation, use the iban on the auxPaymentData (the payment data of the customer profile) and csvData to find the index */
                        (float)$csvData[array_search($auxPaymentData['iban'], array_column($csvData, 'iban'))]['amount'] += (float)$auxPaymentData['amount'];
                        // (float)$csvData[array_search($auxPaymentData['ibanownerdni'], array_column($csvData, 'dni'))]['amount'] += (float)$auxPaymentData['amount'];
                    }

                }
            }
        }
        /* Add the array data to the csv file */
        if (sizeof($csvData) > 0) {
            /* Put the customer/payment data into the csv file */
            fputcsv($csvoutput, ['Nombre', 'Dni', 'Iban', 'Importe', 'Periodo'], ";");
            foreach ($csvData as $data) {
                fputcsv($csvoutput, $data, ";");
            }
        }
        /* Send email with the file generated */
        $mail = new PHPMailer();
        $mail->CharSet = 'UTF-8';
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->isSMTP();
        $mail->Host     = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'ippongymzaragoza@gmail.com';
        /* Using Google app password */
        $mail->Password   = 'iuxkxryeenthqcju';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->setFrom('ippongymzaragoza@gmail.com', 'IPPONGYM ZARAGOZA');
        $mail->addAddress('arzzz@hotmail.es', 'Arturo Casas');
        $mail->addAttachment($filename);
        $mail->isHTML(true);
        $mail->Subject = 'Remesa mensual';
        $mail->Body    = filesize($filename) == 0 ? 'No hay remesas para este mes' : 'Adjunto a este correo tienes los datos de los pagos domiciliados para enviar a la entidad bancaria.';
        $mail->AltBody = filesize($filename) == 0 ? 'No hay remesas para este mes' : 'Adjunto a este correo tienes los datos de los pagos domiciliados para enviar a la entidad bancaria.';
        $mail->send();
        /* Close and delete the file generated */
        fclose($csvoutput);
        unlink($filename);
    }
    /**
     * Function called when a new payment is registered on SociosForm
     *
     * @param Request { id, data } -> id of the socio to add a new payment and data the payment attributes
     */
    public static function newPayment(Request $request) {
        try {
            $newDate = new \MongoDB\BSON\UTCDateTime(new \DateTime('now'));
            $id = $request->id;
            $newPayment = [];
            $customer = Socios::find($id);
            $alreadyExists = false;
            foreach ($customer->payments as $payment) {
                if ($payment['interval'] == $request->interval) {
                    $alreadyExists = true;
                }
            }
            if (!$alreadyExists) {
                /* On the front-end, the reactive mutations prevent that the data payment comes with usaved changes, to prevent possible incosistencies, always use the last payment data stored on the db */
                $newPayment['rate'] = $customer['paymentData']['rate'];
                $newPayment['amount'] = $customer['paymentData']['amount'];
                $newPayment['paymenttype'] = $customer['paymentData']['paymenttype'];
                $newPayment['interval'] = $request->interval;
                $newPayment['iban'] = $customer['paymentData']['paymenttype'] == 'Domiciliación' ? $customer['paymentData']['iban'] : null;
                $newPayment['ibanownerdni'] = $customer['paymentData']['paymenttype'] == 'Domiciliación' ? $customer['paymentData']['ibanownerdni'] : null;
                $newPayment['ibanownername'] = $customer['paymentData']['paymenttype'] == 'Domiciliación' ? $customer['paymentData']['ibanownername'] : null;
                $newPayment['dategenerated'] = $newDate;
                $newPayment['status'] = $request->status ? $request->status : 'Confirmado';
                $newPayment['dateconfirmed'] = $newPayment['status'] != 'Pendiente' ? $newDate : null;
                $customer->push('payments', $newPayment);
                return $newPayment;
            } else {
                return response()->json([
                    'message' => 'Ya existe un pago registrado para este mes.',
                    'socio' => $customer, /* Necessary ? */
                    'status' => 'warning',
                    'title' => 'Registro de pago',
                    'trace' => 'No se ha registrado el pago. Ya existe uno para el mismo periodo de pago',
                ], 500);
            }
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al generar el nuevo pago. Código de error: BePaCo@NePa',
                'status' => 'danger',
                'title' => 'Registro de nuevo pago',
                'trace' => 'Error al generar el nuevo pago. Código de error: BePaCo@NePa. Detalle del servidor: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Function to update the data of registered payments. Can be called individually (from payments or newPayments to confirm states) or massive from payments. Every payment stores the _id of the customer
     *
     * @param Request { data, date, action } data: the current payment data to apply, date (optional): the new date value, action: the action required
     */
    public function updatePayments(Request $request) {
        $arr_updated = [];
        if ($request->action == 'updating') {
            /* If the date is provided transforms it to the mongo format */
            $newFechaConfirmacion = $request->date == null ? $request->date : new \MongoDB\BSON\UTCDateTime(new \DateTime($request->date));
        } else if ($request->action == 'confirmado' || $request->action == 'devuelto') {
            $newFechaConfirmacion = new \MongoDB\BSON\UTCDateTime(new \DateTime('now'));
        }
        try {
            foreach($request->data as $el) {
                $socio = Socios::find($el['_id']);
                if ($request->action == 'updating') {
                    foreach($socio['payments'] as $idx => $pago) {
                        if ($pago['interval'] == $el['interval']) {
                            $pago['rate'] = $el['rate'];
                            $pago['amount'] = (int) $el['amount'];
                            $pago['paymenttype'] = $el['paymenttype'];
                            $pago['status'] = $el['status'];
                            $pago['iban'] = $el['paymenttype'] == 'Domiciliación' ? $el['iban'] : null;
                            $pago['ibanownername'] = $el['paymenttype'] == 'Domiciliación' ? $el['ibanownername'] : null;
                            $pago['ibanownerdni'] = $el['paymenttype'] == 'Domiciliación' ? $el['ibanownerdni'] : null;
                            $pago['dateconfirmed'] = $newFechaConfirmacion; /* Can be null when the status is 'Pendiente' or a date when the new status is 'Confirmado' or 'Devuelto' */
                            $pago['_id'] = $el['_id'];
                            $socio['payments.' . $idx] = $pago;
                            $socio->save();
                            return [
                                'message' => 'Se ha actualizado el pago.',
                                'status' => 'success',
                                'updated' => $pago,
                            ];
                        }
                    }
                    return [
                        'message' => 'No se ha actualizado ningún pago.',
                        'status' => 'danger',
                    ];
                } else if ($request->action == 'confirmado' || $request->action == 'devuelto') {
                    foreach($socio['payments'] as $idx => $pago) {
                        if ($pago['interval'] == $el['interval']) {
                            $pago['status'] = ucFirst($request->action);
                            $pago['dateconfirmed'] = $newFechaConfirmacion;
                            $socio['payments.' . $idx] = $pago;
                            $socio->save();
                            $pago['_id'] =  $el['_id'];
                            array_push($arr_updated, $pago);
                        }
                    }
                }
            }
            return [
                'message' => sizeof($arr_updated) == 0 ? 'No se ha actualizado ningún pago.' : sizeof($arr_updated) == 1 ? 'Se ha actualizado el estado del pago.' : 'Se ha actualizado el estado de los pagos.',
                'number' => sizeof($arr_updated),
                'status' => 'success',
                'title' => 'Actualización de pagos',
                'updated' => $arr_updated,
            ];
        } catch (Exception $e) {
            return response()->json([
                'status' => 'danger',
                'message' => 'Algo no ha ido bien. Vuelve a intentarlo. Código de error: BePaCo@UpPa',
                'title' => 'Actualización de pagos',
                'trace' => 'Error al registrar los cambios. Código de error: BePaCo@UpPa. Detalle del servidor: ' . $e->getMessage(),
            ], 500);
        }
    }
}
