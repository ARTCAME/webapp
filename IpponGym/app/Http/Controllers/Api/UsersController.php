<?php

namespace App\Http\Controllers\Api;

use App\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class UsersController extends Controller {
    /**
     * Search a customer by field/value provided
     *
     * @return User
     */
    public function search(Request $request)
    {
        $field = $request->get('field');
        $value = $request->get('value');
        return  User::where($field,'=',$value)->get();
    }
    /**
     * Registers a new user
     *
     * @return Response with the user or the errorserror
     */
    public function register(Request $request) {
        $data = $request->all();
        $v = Validator::make($request->all(), [
            'name' => 'required|min:3',
            'username' => 'required|min:3|unique:users',
            'email' => 'required|email|unique:users',
            'password'  => 'required|min:3|confirmed',
            'role' => 'required',
        ]);
        if ($v->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $v->errors()
            ], 422);
        }
        $user = new User();
        $user->name = $data['name'];
        $user->username = $data['username'];
        $user->email = $data['email'];
        $user->password = bcrypt($data['password']);
        $user->role = $data['role'];
        $user->save();
        return response()->json([
            'user' => $user,
            'status' => 'success'], 200);
    }
}
