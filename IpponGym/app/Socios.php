<?php

namespace App;

use Jenssegers\Mongodb\Eloquent\Model;

class Socios extends Model {
    protected $connection = 'mongodb';
    protected $collection = 'Personas';

    protected $fillable = [
        'active',
        '_id',
        'sign',
        'image',
        'name',
        'address',
        'dni',
        'dateofbirth',
        'gender',
        'tutor',
        'phones',
        'emails',
        'contacts',
        'payments',
        'paymentdata',
        'belts',
        'rightsProtect',
        'rightsImage',
        'rightsUnderage',
    ];
}
