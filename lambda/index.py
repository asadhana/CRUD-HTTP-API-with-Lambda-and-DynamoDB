import json
import boto3
import os

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME', 'http-crud-tutorial-items')
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    body = None
    status_code = 200
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        route_key = f"{event['requestContext']['http']['method']} {event['requestContext']['http']['path']}"
        
        if route_key == "DELETE /items/{id}":
            table.delete_item(
                Key={'id': event['pathParameters']['id']}
            )
            body = f"Deleted item {event['pathParameters']['id']}"
            
        elif route_key == "GET /items/{id}":
            response = table.get_item(
                Key={'id': event['pathParameters']['id']}
            )
            body = response.get('Item')
            
        elif route_key == "GET /items":
            response = table.scan()
            body = response.get('Items', [])
            
        elif route_key == "PUT /items":
            request_json = json.loads(event['body'])
            table.put_item(
                Item={
                    'id': request_json['id'],
                    'price': request_json['price'],
                    'name': request_json['name']
                }
            )
            body = f"Put item {request_json['id']}"
            
        else:
            raise Exception(f'Unsupported route: "{route_key}"')
            
    except Exception as err:
        status_code = 400
        body = str(err)
    
    return {
        'statusCode': status_code,
        'body': json.dumps(body),
        'headers': headers
    }
