<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::prefix('auth')->group(function () {
    Route::post('login', 'AuthController@login')->name('login');
    /* Except the login page, all the rest of auth actions are under jwt authorization */
    Route::middleware('jwt')->group(function () {
        Route::post('refresh', 'AuthController@refresh');
        Route::get('user', 'AuthController@user');
        Route::get('me', 'AuthController@me');
        Route::post('logout', 'AuthController@logout');
    });
});
Route::namespace('Api')->group(function() {
    /* All the regular actions are under token authorization */
    Route::middleware('jwt')->group(function () {
        /* Belts */
        Route::post('autoBelts', 'BeltsController@autoBelts');
        Route::post('deleteBelts', 'BeltsController@deleteBelts');
        Route::post('updateBelts', 'BeltsController@updateBelts');
        /* Customers */
        Route::get('customers', 'CustomersController@index');
        Route::get('customer/{id}', 'CustomersController@show');
        Route::put('customer/{id}/edit', 'CustomersController@edit');
        Route::post('newCustomer', 'CustomersController@newCustomer');
        Route::post('updatePaymentData', 'CustomersController@updatePaymentData');
        /* Payments */
        Route::post('deletePayments', 'PaymentsController@deletePayments');
        Route::post('monthlyPayments', 'PaymentsController@monthlyPayments');
        Route::post('newPayment', 'PaymentsController@newPayment');
        Route::post('updatePayments', 'PaymentsController@updatePayments');
        /* Users */
        Route::post('register', 'UsersController@register');
        Route::post('usersearch', 'UsersController@search');
        Route::get('getAllTests', 'UsersController@getAllTests');
        Route::get('getTests', 'UsersController@getTests');
        Route::post('saveTests', 'UsersController@saveTests');
    });
});
