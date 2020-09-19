<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Socios;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;


class CustomersController extends Controller {
    /**
     * Stores the update of a customer, auto discard the changes on _id and customerNumber (never will be modified) or payments that are modified in other way
     *
     * @param String $id: the id of the customer to update
     * @param Request $request: the form with the data to update
     *
     * @return Response|Array If an error ocurs return a response with the error data. If everything is correct return a regular array.
     */
    public function edit($id, Request $request) {
        $valid = $this->validData($request);
        $updated = false;
        if ($valid) {
            try {
                $socio = Socios::find($id);
                foreach ($request->all() as $req_field => $req_value) {
                    if ($req_field != 'updated_at' && $req_field != 'created_at' && $req_field != '_id' && $req_field != 'customerNumber' && $req_field != 'payments' && $socio->$req_field != $req_value) {
                        $socio->$req_field = $req_value;
                        $updated = true;
                    }
                }
                if (!$updated) {
                    return [
                        'message' => 'Guardado, pero no había ningún cambio.',
                        'status' => 'warning',
                        'title' => 'Edición de socio',
                    ];
                } else {
                $socio->save();
                    return [
                        'message' => 'Socio actualizado correctamente.',
                        'status' => 'success',
                        'title' => 'Edición de socio',
                    ];
                }
            } catch (Exception $e) {
                return response()->json([
                    'message' => 'Error al guardar los datos. Código de error: BeCuCo@Ed',
                    'status' => 'danger',
                    'title' => 'Edición de socio',
                    'trace' => 'Error al guardar los datos editados del socio. Código de error: BeCuCo@Ed. Detalle del servidor: ' . $e->getMessage(),
                ], 500);
            }
        }
    }
    /**
     * Gets all the customers from the database
     *
     * @return Response If the customers was retrieved returns it, if not returns a error message
     */
    public function index() {
        try {
            return DB::collection('customers')->get();
            // return Socios::all();
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los socios de la base de datos. Código de error BeCuCo@In',
                'status' => 'danger',
                'title' => 'Obtener socios',
                'trace' => 'Error al obtener los datos de la base de datos. Código de error: BeCuCo@In. Detalle del servidor: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Stores a new customer
     *
     * @param Request $request: the form data to store
     *
     * @return Response|Array If an error ocurs return a response with the error data. If everything is correct return a regular array.
     */
    public function newCustomer(Request $request) {
        /* Validate the data */
        $valid = $this->validData($request);
        if ($valid === true) {
            $socio = new Socios;
            try {
                /* Stores all the fields received except the _id that is generated by mongo */
                foreach ($request->all() as $field => $value) {
                    if ($field != '_id') {
                        $socio->$field = $value;
                    }
                }
                /* Determine the last customer number assigned to assign correctly to the current save */
                $lastCustomerNumber = 0;
                foreach ($this->index() as $customer) {
                    $lastCustomerNumber = $customer['customerNumber'] > $lastCustomerNumber ? $customer['customerNumber'] : $lastCustomerNumber;
                }
                $socio->customerNumber = ++$lastCustomerNumber;
                $socio->save();
                return [
                    'newCustomer' => $socio,
                    'message' => 'Socio creado correctamente.',
                    'status' => 'success',
                    'title' => 'Creación de socio',
                ];
            } catch (Exception $e) {
                return response()->json([
                    'message' => 'Error al registrar al nuevo socio. Código de error: BeCuCo@NeCu',
                    'status' => 'danger',
                    'title' => 'Creación de socio',
                    'trace' => 'Error al guardar los datos del nuevo socio. Código de error: BeCuCo@NeCu. Detalle del servidor: ' . $e->getMessage(),
                ], 500);
            }
        } else {
            return $valid;
        }
    }
    /**
     * Find a customer by id
     *
     * @param String $id: The id of the customer to search
     *
     * @return Socio|Null when everything was correct return the customer data, if not, returns a flag to navigate to a 404 page
     */
    public function show($id) {
        $socio = Socios::find($id);
        if ($socio == null) {
            return '404';
        }
        return $socio;
    }
    /**
     * Validates the customer form on saves or updates
     *
     * @param Request $request: the form data to check
     *
     * @return Response|Boolean If the validation fails returns a response to vue with the errors. If the validation pass returns true to the caller function
     */
    private function validData(Request $request) {
        $data = $request->all();
        $rules = [
            'name' => 'required',
            'dni' => 'required',
            // 'sign' => 'required', // the sign is no required for now to pevent fails
            'dateofbirth' => 'required|date',
            'paymentData.rate' => 'required',
            'paymentData.paymenttype' => 'required',
            'paymentData.amount' => 'required',
        ];
        if ($request->paymentData['paymenttype'] == 'Domiciliación') {
            $rules += ['paymentData.iban' => 'required'];
        }
        if ($request->dateofbirth != null && date_diff(date_create(date('Y-m-d')), date_create($request->dateofbirth))->y < 18) {
            /* If the customer is underage his dni is not required */
            array_splice($rules, 1, 1);
            /* If a tutor is added and it doesn't comes with _id (in this case we only store the _id as a reference of the customer selected), validate that we have the required fields */
            foreach ($data['tutor'] as $key => $value) {
                if ($key == '_id' && $value == null) {
                    $rules += [
                        'tutor.name' => 'required',
                        'tutor.dni' => 'required',
                    ];
                }
            }
        }
        /* Build the error message */
        $messages = [
            'name.required' => 'El nombre es obligatorio',
            'dni.required' => 'El dni es obligatorio',
            'dateofbirth.required'  => 'La fecha de nacimiento es obligatoria',
            // 'sign.required'  => 'La firma del socio es obligatoria',
            'tutor.name.required' => 'El nombre del tutor es obligatorio',
            'tutor.dni.required' => 'El dni del tutor es obligatorio',
            'paymentData.rate.required' => 'Tienes que escoger una tarifa',
            'paymentData.paymenttype.required' => 'Tienes que escoger una forma de pago',
            'paymentData.amount.required' => 'Tienes que indicar un importe para la cuota',
            'paymentData.iban.required' => 'Tienes que añadir el iban para el pago domiciliado',
        ];
        /* Validate the form */
        $v = Validator::make($data, $rules, $messages);
        /* Return the errors if exists */
        if ($v->fails()) {
            return response()->json([
                'message' => 'Se han producido los siguientes errores:',
                'status' => 'danger',
                'title' => 'Error al validar los datos',
                'trace' => 'Error al validar los datos del nuevo socio, no se han guardado. Código de error: BeCuCo@VaDa. Detalle del servidor: ' . $v->errors(),
                'validationErrors' => $v->errors(),
            ], 422);
        }
        return true;
    }
}
