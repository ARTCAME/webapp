<?php

namespace App\Http\Controllers;

use App\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller {
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
                'message' => 'Error al obtener los usuarios de la base de datos. Código de error AC@I',
                'status' => 'danger',
                'title' => 'Obtener usuarios',
                'trace' => 'Error al obtener todos los datos de la base de datos. Código de error: AC@I. Detalle del servidor: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Login user and return a token
     *
     * @return Response with the user/token data or error
     */
    public function login(Request $request) {
        $credentials = $request->only('username', 'password');
        try {
            if ($token = JWTAuth::attempt($credentials)) {
                return $this->respondWithToken($token, JWTAuth::user());
            }
        } catch (JWTException $jwte) {
            return response()->json(['error' => 'could_not_create_token'], 500);
        }
        return response()->json([
            'message' => 'login_error'
        ], 401);
    }
    /**
     * Logout User
     *
     * @return Response
     */
    public function logout() {
        auth()->logout();
        return response()->json([
            'status' => 'success',
            'message' => 'Logged out Successfully.'
        ], 200);
    }
    /**
     * Get the authenticated user
     *
     * @return Response with the current user
     */
    public function me() {
        return response()->json(auth()->user());
    }
    /**
     * Get authenticated user
     *
     * @return Response with the current user
     */
    public function user(Request $request) {
        $user = User::find(auth()->user()->id);
        return response()->json([
            'status' => 'success',
            'data' => $user
        ]);
    }
    /**
     * Refresh JWT token
     */
    public function refresh() {
        return $this->respondWithToken(auth()->refresh(), auth()->user());
    }
    /**
     * Return auth guard
     */
    private function guard() {
        return auth()->guard('api');
    }
    /**
     * Get the token array structure.
     *
     * @param string $token
     *
     * @return Response
     */
    protected function respondWithToken($token, $user) {
        return response()->json([
            'token' => 'Bearer ' . $token,
            'token_type' => 'bearer',
            // 'expires_in' => Auth::factory()->getTTL() * 240,
            'expires_in' => auth()->factory()->getTTL() * 240,
            'user' => $user,
        ]);
    }
}
