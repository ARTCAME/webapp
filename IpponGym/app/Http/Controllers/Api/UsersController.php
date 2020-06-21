<?php

namespace App\Http\Controllers\Api;

use App\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

class UsersController extends Controller {
    /**
     * Search a user by field/value provided
     *
     * @return User
     */
    public function search(Request $request) {
        $field = $request->get('field');
        $value = $request->get('value');
        return  User::where($field, '=', $value)->get();
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
    /**
     * Get the all the tests by user
     *
     * @return Response with the array of the tests
     */
    public function getAllTests(Request $request) {
        try {
            $users = DB::collection('users')->get();
            $tests = [];
            foreach($users as $user) {
                if (array_key_exists('tests', $user)) {
                    foreach($user['tests'] as $test) {
                        array_push($tests, $test);
                    }
                }
            }
            return $tests;
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ]);
        }
    }
    /**
     * Get the tests maded by the user
     *
     * @return Response with the array of the tests
     */
    public function getTests(Request $request) {
        try {
            $user = User::where('username', $request[0])->first();
            return $user['tests'];
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ]);
        }
    }
    /**
     * Save the tests maded by the user
     *
     * @return Response with the array of the tests
     */
    public function saveTests(Request $request) {
        try {
            $user = User::where('username', $request->username)->first();
            $user->push('tests', array($request->test));
            return $user;
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ]);
        }
    }
}
