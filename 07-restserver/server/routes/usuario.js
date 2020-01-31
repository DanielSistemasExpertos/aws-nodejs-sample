
const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

// importamos el modelo de usuarios
const Usuario = require('../models/usuario');

const app = express();

app.get('/usuario', function (req, res) {
    
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);
    //busca filtrando desde | hasta {{url}}/usuario/?limite=10&desde=10 de registros con estado activo(true)
    Usuario.find({ estado: true }, 'nombre email role estado google img')
            .skip(desde)
            .limit(limite)
            .exec( (err, usuarios) => {

                if( err ) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                // retorna el total de registro con estado activo(true)
                Usuario.count({ estado: true }, (err, conteo) => {
                    res.json({
                        ok: true,
                        usuarios,
                        conteos: conteo
                    })
                })


            })
});
 
app.post('/usuario', function (req, res) {

    let body = req.body;

    //Instanciamos y creamos un nuevo usuario 
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save(( err, usuarioDB ) => {
        
        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
});

app.put('/usuario/:id', function (req, res) {
    
    let id = req.params.id;
    let body = _.pick( req.body, ['nombre','email', 'img', 'role', 'estado'] );

    delete body.password;
    delete body.google;

    //busca por id, actualiza y retorna los nuevo
    Usuario.findByIdAndUpdate( id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
        
        if( err ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
});

app.delete('/usuario/:id', function (req, res) {
    
    let id = req.params.id;
    // busca el usuario por el id pasado y lo elimina
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
       
    let cambiaEstado = {
        estado: false
    };
    // busca el usuario por el id pasado y le cambia el estado
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {
        //error
        if(err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        // si no encuentra al usuario {{url}}/usuario/5e331598a66f1b21b4cea85a
        if ( !usuarioBorrado ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        // user delete
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });

    });

});

module.exports = app;