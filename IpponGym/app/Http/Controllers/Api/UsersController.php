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
     * Gets all the users from the database
     *
     * @return Response If the customers was retrieved returns it, if not returns a error message
     */
    public function index() {
        try {
            return DB::collection('users')->get();
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los usuarios de la base de datos. Código de error BeUsCo@In',
                'status' => 'danger',
                'title' => 'Obtener usuarios',
                'trace' => 'Error al obtener todos los datos de la base de datos. Código de error: BeUsCo@In. Detalle del servidor: ' . $e->getMessage(),
            ], 500);
        }
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
        try {
            $user = new User();
            $user->name = $data['name'];
            $user->username = $data['username'];
            $user->email = $data['email'];
            $user->password = bcrypt($data['password']);
            $user->role = $data['role'];
            $user->wantNews = $data['role'] == 'tester' ? true : false;
            /* On the AuthController, the below data will be refreshed */
            $user->last_login = '';
            $user->last_login_ip = '';
            $user->login_count = 0;
            $user->save();
            return response()->json([
                'status' => 'success',
                'title' => 'Nuevo usuario',
                'message' => 'Usuario creado correctamente',
                'user' => $user,
            ], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al guardar los datos. Código de error: BeUsCo@Re',
                'status' => 'danger',
                'title' => 'Edición de socio',
                'trace' => 'Error al guardar los datos editados del socio. Código de error: BeUsCo@Re. Detalle del servidor: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Search a user by field/value provided
     *
     * @return User
     */
    public function search(Request $request) {
        try {
            $field = $request->get('field');
            $value = $request->get('value');
            return  User::where($field, '=', $value)->get();
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error al obtener la búsqueda de usuario. Código de error BeUsCo@Se',
                'status' => 'danger',
                'title' => 'Buscar usuarios',
                'trace' => 'Error al obtener la búsqueda de usuario. Código de error: BeUsCo@Se. Detalle del servidor: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function showNews(Request $request) {
        $user = User::where('username', $request->username)->first();
        return response()->json($user->wantNews);
    }
    public function unwantNews(Request $request) {
        $user = User::where('username', $request->username)->first();
        $user->wantNews = false;
        $user->save();
    }
    public function wantNews(Request $request) {
        $users = User::where('role', 'tester')->orWhere('role', 'root')->get();
        foreach ($users as $user) {
            $user->wantNews = true;
            $user->save();
        }
    }
}
