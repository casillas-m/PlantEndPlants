const AWS = require('aws-sdk')
var docClient = new AWS.DynamoDB.DocumentClient()
const dynamoDB = new AWS.DynamoDB({region: 'us-east-1', apiVersion: '2012-08-10'});

exports.handler = (event, context, cb) => {
    let verb = event.httpMethod
    console.log(`Verb was ${verb}`)
    let params = ""
    //  cb(null, event)
    switch (verb) {
        case 'GET':
            params = {
                TableName: 'PlantEndDB_Plants',
                KeyConditionExpression: "#email = :mail",
                ExpressionAttributeNames:{
                    "#email": "email"
                },
                ExpressionAttributeValues: {
                    ":mail": event.email_param
                }
            }
            docClient.query(params, (err, data) => {
                if (err) {
                    console.log(err)
                    cb(err)
                } else {
                    cb(null,data.Items)
                }
            })
            break;
        case 'PUT':
            let ExpressionAttributeValues = {}
            if(event.endpoint_iot)ExpressionAttributeValues[":iot"]=event.endpoint_iot
            if(event.hum_needed)ExpressionAttributeValues[":h"]=event.hum_needed
            if(event.img_url)ExpressionAttributeValues[":url"]=event.img_url
            if(event.light_needed)ExpressionAttributeValues[":l"]=event.light_needed
            if(event.plant_name)ExpressionAttributeValues[":p"]=event.plant_name
            if(event.common_name)ExpressionAttributeValues[":c"]=event.common_name
            if(event.soil)ExpressionAttributeValues[":s"]=event.soil
            if(event.countDownDate)ExpressionAttributeValues[":cdd"]=event.countDownDate
            if(event.water)ExpressionAttributeValues[":w"]=event.water
            params = {
                TableName: 'PlantEndDB_Plants',
                Key:{
                    "email":event.email,
                    "plant_id": event.plant_id
                },
                UpdateExpression: `set ${event.soil?"soil=:s":""} ${event.endpoint_iot?",endpoint_iot=:iot":"" } ${event.hum_needed?",hum_needed=:h":"" } ${event.img_url?",img_url=:url":""} ${event.light_needed?",light_needed=:l":""} ${event.plant_name?",plant_name=:p":""} ${event.common_name?",common_name=:c":""} ${event.countDownDate?",countDownDate=:cdd":""} ${event.water?",water=:w":"" }`,
                ExpressionAttributeValues:ExpressionAttributeValues,
                ReturnValues:"UPDATED_NEW"
            }
            docClient.update(params, (err, data) => {
                if (err) {
                    console.log(err)
                    cb(err)
                } else {
                    cb(null,data)
                }
            })
            break;
        case 'POST':
            console.log(event)
            params = {
                TableName: 'PlantEndDB_Plants',
                Item:{
                  "email": {S:event.email},
                  "endpoint_iot": {S:event.endpoint_iot},
                  "hum_needed": {N:`${event.hum_needed}`},
                  "img_url": {S:event.img_url},
                  "light_needed": {N:`${event.light_needed}`},
                  "plant_id": {S:event.plant_id},
                  "plant_name": {S:event.plant_name},
                  "common_name": {S:event.common_name},
                  "water": {S:event.water},
                  "soil": {S:event.soil}
                }
            }
            dynamoDB.putItem(params, (err, data) => {
                if (err) {
                    console.log(err)
                    cb(err)
                } else {
                    cb(null,data)
                }
            })
            break;
        case 'DELETE':
            params = {
                TableName: 'PlantEndDB_Plants',
                Key:{
                    "email":{S:event.email},
                    "plant_id": {S:event.plant_id}
                }
            }
            dynamoDB.deleteItem(params, (err, data) => {
                if (err) {
                    console.log(err)
                    cb(err)
                } else {
                    cb(null,data)
                }
            })
            break;
        default:
            cb(null,{error:"Method"})
            break;
    }
};
