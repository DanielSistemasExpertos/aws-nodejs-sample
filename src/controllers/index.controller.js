// modulo para conectarnos a las bd de postgres
const { Pool } = require('pg');
const utf8 = require('utf8');
// modulos para usar los servicios de aws
const AWS = require('aws-sdk');
// Enter copied or downloaded access ID and secret key here
const ID = 'ID aws';
const SECRET = 'secret aws';

//configuración de nuestra conexión en pg
const pool = new Pool({
    host: 'host',
    user: 'userbd',
    password: 'passwd bd',
    database: 'nombre_bd',
    port: 'number_port'
});


// Now, we need to initialize the ComprehendMedical interface by passing our access keys:
const comprehendmedical = new AWS.ComprehendMedical({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    region: 'us-east-1',
    LanguageCode: 'es',
});

const translate = new AWS.Translate({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    region: 'us-east-1',
});
 

//metodo para obtener datos de tabla epicrisis_hospitalizados
const getEpicrisisHospitalizados = async(req, res) => {
    const response = await pool.query('SELECT epicrisis_id, hosp_id, epicrisis_resumen, doc_id FROM epicrisis_hospitalizados WHERE doc_id > 0 order by epicrisis_id asc limit 100');
    res.status(200).json(response.rows); 
}

// funcion para obtener datos de epicrisis_hospitalizados por el hosp_id(c:c)
const getEpicrisisHospitalizadosByHospId = async(req, res) => {
    const hosp_id = req.params.hosp_id
    const response = await pool.query('SELECT epicrisis_id, hosp_id, epicrisis_resumen, doc_id FROM epicrisis_hospitalizados WHERE hosp_id = $1', [hosp_id]);
    
    if(response.rows != '' )
    {
        //si ha sido verificado por el doctor
        if(response.rows[0].doc_id > 0){
            const id_epicrisis_hospitalizados = response.rows[0].epicrisis_id;
            
            const responseEntities = await pool.query('SELECT * FROM epicrisis_hospitalizados_entities  WHERE id_epicrisis_hospitalizados = $1', [id_epicrisis_hospitalizados])
            const responseUnmappedAttributes = await pool.query('SELECT * FROM epicrisis_hospitalizados_unmapped_attributes WHERE id_epicrisis_hospitalizados = $1', [id_epicrisis_hospitalizados])
            console.log(responseEntities.rows)
            response.rows[0].epicrisis_resumen = utf8.decode(response.rows[0].epicrisis_resumen)
            res.json(
                    {
                        Respuesta:response.rows,
                        Entities: responseEntities.rows,
                        UnmappedAttributes: responseUnmappedAttributes.rows
                    }
                );
        }else{
            response.rows[0].epicrisis_resumen = utf8.decode(response.rows[0].epicrisis_resumen)
            res.json(
                {
                    Respuesta:[
                        {
                            mensaje: ' No ha sido verificado por el doctor '
                        },
                        {
                            Respuesta:response.rows
                        }
                        
                    ]
                }
            
                );
        }
    }else{
        res.json(
            {
                Respuesta:[
                    {
                        mensaje: ' No existe este registro '
                    }
                    
                ]
            }
        
            );
    }
    
}

// funcion para obtener datos de la tabla epicrisis_hospitalizados analizarlos con detectEntitiesV2 y insertarlos
const creaEHdetectEntities = async (req, res) => {
    // c.c
    const hosp_id = req.params.hosp_id
    // const response = await pool.query('SELECT epicrisis_id, hosp_id, epicrisis_resumen FROM epicrisis_hospitalizados order by epicrisis_id asc limit 1');
    const response =  await pool.query('SELECT epicrisis_id, hosp_id, epicrisis_resumen, doc_id FROM epicrisis_hospitalizados WHERE hosp_id = $1', [hosp_id])
    // para mostrarlo en el navegador
    // res.status(200).json(response.rows);

    // si existe la c.c
    if(response.rows != '' )
    {
        //si ha sido verificado por el doctor, lo busco para analizar con detectEntities
        if(response.rows[0].doc_id > 0){
            var id_epicrisis_hospitalizados = response.rows[0].epicrisis_id;
            var epicrisis_resumen = utf8.decode(response.rows[0].epicrisis_resumen);

            var responseEntities = await pool.query('SELECT * FROM epicrisis_hospitalizados_entities  WHERE id_epicrisis_hospitalizados = $1', [id_epicrisis_hospitalizados])
            var responseUnmappedAttributes = await pool.query('SELECT * FROM epicrisis_hospitalizados_unmapped_attributes WHERE id_epicrisis_hospitalizados = $1', [id_epicrisis_hospitalizados])
            
            //si ya fue insertado mostro los datos y salgo
            if(responseEntities.rows != '' )
            {
                res.json([
                    {
                    Respuesta:[
                        {
                            mensaje: ' Ya existe esta entidad ',
                            texto_analizado: epicrisis_resumen
                        }
                        
                    ]
                    },
                    {
                    Entities: responseEntities.rows
                    },
                    {
                    UnmappedAttributes: responseUnmappedAttributes.rows
                    }
                    
                ]
                    );
                return;
            }else{
                var dataTraducida = '';
                ////////////// traducir de es a en ////////////////////////////
                var paramsTraducir = {
                    Text: epicrisis_resumen,
                    SourceLanguageCode: 'es',
                    TargetLanguageCode: 'en'
                };

                translate.translateText(paramsTraducir, function(errTra, dataTra) {
                    if (errTra) {
                        console.log(errTra, errTra.stack);
                        alert("Error al llamar Amazon Translate. " + errTra.message);
                        return;
                    }
                    //si se traduce el epicrisis lo envio a analizar con comprehend
                    if (dataTra) {
                        dataTraducida = dataTra.TranslatedText;
                        
                        if(dataTraducida){
                            ///////////////////////////// analizar con comprehend medical ///////////////////
                        const params = {
                            Text: dataTraducida
                            // Text: JSON.stringify(epicrisis_resumen)
                        };
                        console.log('data traducida ' + dataTraducida);
                        
                        // res.json(dataTraducida);
                        // return;

                        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ComprehendMedical.html#detectEntitiesV2-property
                        // Detectar entidades
                        // Use la operación DetectEntities para detectar las entidades médicas en su texto. Detecta entidades en las siguientes categorías:
                        // ANATOMY, MEDICAL_CONDITION, MEDICATION, PROTECTED_HEALTH_INFORMATION, TEST_TREATMENT_PROCEDURE
                        comprehendmedical.detectEntitiesV2
                        (params, function (err, data) {
                            if (err) console.log(err, err.stack); // an error occurred
                            // else     console.log(data);           // successful response
                            var id_entities = '';
                            var begin_offset = '';
                            var end_offset = '';
                            var score = '';
                            var text = '';
                            var category = '';
                            var type = '';
                            // Traits[]
                            var traits_name = '';
                            var traits_score = null;
                            
                            // Attributes []
                            var Attributes_Type = '';
                            var Attributes_Score = null;
                            var Attribute_RelationshipScore = null;
                            var Attribute_Id = null;
                            var Attribute_BeginOffset = null;
                            var Attribute_EndOffset = null;
                            var Attribute_Text = '';
                            var A_traits_name  =  '';
                            var A_traits_score = null;
                            
                            // UnmappedAttributes
                            var unmapped_attributes_type = '';
                            var unmapped_attributes_type2 = '';
                            var unmapped_attributes_score = '';
                            var unmapped_attributes_id = '';
                            var unmapped_attributes_beginoffset = '';
                            var unmapped_attributes_endoffset = '';
                            var unmapped_attributes_text = '';
                            var unmapped_attributes_traitsname = '';
                            var unmapped_attributes_traitsscore = '';
                            if(data){
                                
                                res.status(200).json(data);

                                // recorro el objeto
                                data['Entities'].forEach(element => {
                                    
                                    id_entities = element.Id;
                                    begin_offset = element.BeginOffset;
                                    end_offset = element.EndOffset;
                                    score   =   element.Score;
                                    text    =   element.Text;
                                    category    =   element.Category;
                                    type    =   element.Type;
                                    traits_name = '';
                                    traits_score = null;
                                    
                                    if(element.Traits != ''){
                                        element['Traits'].forEach(Trai => {
                                            traits_name  =  Trai.Name;
                                            traits_score = Trai.Score;
                                            // console.log('Traits Texto ' + traits_name + "\n");
                                            // console.log('Traits Score ' + traits_score + "\n");
                                        });  
                                    }
                                    // Attributes: [] de Entities: []
                                    if(typeof element.Attributes !== 'undefined' && element.Attributes != ''){
                                        element['Attributes'].forEach(Attribute => {
                                            
                                            Attributes_Type  =  Attribute.Type;
                                            Attributes_Score = Attribute.Score;
                                            Attribute_RelationshipScore = Attribute.RelationshipScore;
                                            Attribute_Id = Attribute.Id;
                                            Attribute_BeginOffset = Attribute.BeginOffset;
                                            Attribute_EndOffset = Attribute.EndOffset;
                                            Attribute_Text = Attribute.Text;

                                            // Traits: [ ] de Attributes: []
                                            if(Attribute.Traits != ''){
                                                Attribute['Traits'].forEach(Trai => {
                                                    A_traits_name  =  Trai.Name;
                                                    A_traits_score = Trai.Score;
                                                });  
                                            }
                                        });  
                                    }
                                    
                                    //
                                    // guardo los datos en la tabla
                                        var response =  pool.query('INSERT INTO epicrisis_hospitalizados_entities (id_entities, begin_offset, end_offset, score, text, category, type, traits_name, traits_score, id_epicrisis_hospitalizados, attributes_type, attributes_score, attribute_relationshipscore, attribute_id, attribute_beginoffset, attribute_endoffset, attribute_text, a_traits_name, a_traits_score  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)',
                                        [id_entities, begin_offset, end_offset, score, text, category, type, traits_name, traits_score, id_epicrisis_hospitalizados,
                                            Attributes_Type, Attributes_Score, Attribute_RelationshipScore, Attribute_Id, Attribute_BeginOffset, Attribute_EndOffset, 
                                            Attribute_Text, A_traits_name, A_traits_score ]);
                                        console.log("\n" + ' Datos insertados' + "\n");
                                    
                                    

                                });
                                
                                // esto lo usare para guardarlo en la tabla epicrisis_hospitalizados_unmapped_attributes
                                if(data['UnmappedAttributes']){
                                    data['UnmappedAttributes'].forEach(UnmappedAttributes => {
                                        unmapped_attributes_type = UnmappedAttributes.Type;
                                        if(UnmappedAttributes.Attribute != ''){
                                            unmapped_attributes_type2 = UnmappedAttributes.Attribute.Type;
                                            unmapped_attributes_score = UnmappedAttributes.Attribute.Score;
                                            unmapped_attributes_id = UnmappedAttributes.Attribute.Id;
                                            unmapped_attributes_beginoffset = UnmappedAttributes.Attribute.BeginOffset;
                                            unmapped_attributes_endoffset = UnmappedAttributes.Attribute.EndOffset;
                                            unmapped_attributes_text = UnmappedAttributes.Attribute.Text;
                                            unmapped_attributes_traitsname = '';
                                            unmapped_attributes_traitsscore = null;
                                            if(UnmappedAttributes.Attribute.Traits != ''){
                                                UnmappedAttributes.Attribute.Traits.forEach(UATrai => {
                                                    unmapped_attributes_traitsname  =  UATrai.Name;
                                                    unmapped_attributes_traitsscore = UATrai.Score;
                                                    // console.log('UATraits Texto ' + unmapped_attributes_traitsname + "\n");
                                                    // console.log('UATraits Score ' + unmapped_attributes_traitsscore + "\n");
                                                });  
                                            }
                                            
                                        }
                                        
                                        var response =  pool.query('INSERT INTO epicrisis_hospitalizados_unmapped_attributes (id_epicrisis_hospitalizados, unmapped_attributes_type, unmapped_attributes_type2, unmapped_attributes_score, unmapped_attributes_id, unmapped_attributes_beginoffset, unmapped_attributes_endoffset, unmapped_attributes_text, unmapped_attributes_traitsname, unmapped_attributes_traitsscore  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [id_epicrisis_hospitalizados, unmapped_attributes_type, unmapped_attributes_type2, unmapped_attributes_score, unmapped_attributes_id, unmapped_attributes_beginoffset, unmapped_attributes_endoffset, unmapped_attributes_text , unmapped_attributes_traitsname, unmapped_attributes_traitsscore ]);
                                        console.log("\n" + ' Datos insertados' + "\n");
                                    });
                                }

                            }

                        });
                        }else{
                            console.log(' no se ha podido traducir ');
                        }
                    }
                });
                ////////////////////// fin traducir de es a en //////////////////////
                
            }
        }else{
            //aqui
            response.rows[0].epicrisis_resumen = utf8.decode(response.rows[0].epicrisis_resumen)
            res.json({
                    Respuesta:[
                        {
                            mensaje: ' No ha sido verificado por el doctor '
                        },
                        {
                            Respuesta:response.rows
                        }
                        
                    ]
                });  
        }
    }else{
        res.json(
            {
                Respuesta:[
                    {
                        mensaje: ' No existe este registro '
                    }
                    
                ]
            }
        
            );
    }
    
    // res.send('epicrisis hospitalizados');
}


//exportamos modul(o)s
module.exports = {
    getEpicrisisHospitalizados,
    getEpicrisisHospitalizadosByHospId,
    creaEHdetectEntities
}
