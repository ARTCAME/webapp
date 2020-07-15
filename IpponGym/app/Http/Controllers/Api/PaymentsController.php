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
        $allSocios = DB::collection('customers')->where('active', true)->get();
        $nuevoPago = [];
        $fecha = new \MongoDB\BSON\UTCDateTime(new \DateTime('now'));

    // fclose($csv);
    // $csvoutput = fopen('_Remesa_.csv', 'w');

        // foreach ($allSocios as $socio) {
        //     $auxDatosPago = $socio['paymentData'];
        //     /* Sort the array of payments attributes to obtain the last registered on position [0] */
        //     // usort($auxDatosPago, function ($a,$b) {
        //     //     return $a['fecha'] > $b['fecha'] ? -1 : $a['fecha'] == $b['fecha'] ? 0 : 1 /* $b['fecha'] <=> $a['fecha'] */;
        //     // });
        //     /* Check if for the customer we have a payment for the current month-year */
        //     $pagoYaGenerado = false;
        //     foreach ($socio['payments'] as $payment) {
        //         if ($payment['interval'] == date('m-Y')) {
        //             $pagoYaGenerado = true;
        //         }
        //     }
        //     /* If doesn't exists a payment registered for this month we create and save it on the customer based on the last payments attributes */
        //     if (!$pagoYaGenerado) {
        //         $nuevoPago['rate'] = $auxDatosPago[0]['rate'];
        //         $nuevoPago['amount'] = $auxDatosPago[0]['amount'];
        //         $nuevoPago['paymenttype'] = $auxDatosPago[0]['paymenttype'];
        //         $nuevoPago['iban'] = $auxDatosPago[0]['iban'];
        //         $nuevoPago['interval'] = date('Y-m');
        //         $nuevoPago['status'] = 'Pendiente';
        //         $nuevoPago['dategenerated'] = $fecha;
        //         $nuevoPago['dateconfirmed'] = null;
        //         $auxSocio = Socios::find($socio['_id']);
        //         $auxSocio->push('payments', $nuevoPago);
        //         $auxSocio->save();
        //         /* Manage the csv data */
        //         // fputcsv($filename, [$socio['nombre'], $socio['dni'], $nuevoPago['iban'], $nuevoPago['amount'], $nuevoPago['interval']]);
        //     }
        // }
        /* E-mail send with the file generated */
        $mail = new PHPMailer();
        $mail->CharSet = 'UTF-8';
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->isSMTP();
        $mail->Host     = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'ippongymzaragoza@gmail.com';
        $mail->Password   = 'k3.\AACN';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->setFrom('ippongymzaragoza@gmail.com', 'IPPONGYM ZARAGOZA');
        $mail->addAddress('arzzz@hotmail.es', 'Arturo Casas');
        // $file = fopen('C:\Users\arzzz\OneDrive\Escritorio\ipponpass.txt','r');
        // fclose($file);
        // $mail->addAttachment($file, 'Remesa.csv');
        $mail->isHTML(true);
        $mail->Subject = 'Remesa mensual';
        $mail->Body    = 'Aquí tienes tu remesa mensual';
        $mail->AltBody = 'Aquí tienes tu remesa mensual';
        $mail->send();
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
