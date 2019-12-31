const AWS = require('aws-sdk');
 
// Enter copied or downloaded access ID and secret key here
const ID = 'tu access ID';
const SECRET = 'tu secret key';
 
 
// Now, we need to initialize the ComprehendMedical interface by passing our access keys:
const comprehendmedical = new AWS.ComprehendMedical({
    accessKeyId: ID,
    secretAccessKey: SECRET,
    region: 'us-east-1',
    LanguageCode: 'es',
});
 
const params = {
    Text: 'Paciente sin antecedentes personales de interés es traído por SAMU ayer a las 23:00 dado ingesta de 30 comprimidos de sertralina hace 3 horas y consumo de OH sin intento suicida por lo que refiere. El SAPU fue manejado con carbono activado, volemización y antiemético. Paciente ingresa HDN estable con náuseas y vómitos, epigastralgia y leve dolor torácico.  Se maneja con antiemético y volemización. ECG normal. Exámenes de laboratorio normales. Paciente refiere persistir con leves náuseas, pero sin dolor precordial, sin nuevos episodios de vómito, sin palpitaciones.'
};
 
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/ComprehendMedical.html#detectEntitiesV2-property
comprehendmedical.detectEntitiesV2
(params, function (err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    // else     console.log(data);           // successful response
    if(data){
        data['Entities'].forEach(element => { 
            console.log(element); 
          });
    }

  });
 
// ir a la consola y ejecutar el comando node comprehendMedical.js
