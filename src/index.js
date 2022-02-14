import app from './app';

app.listen(app.get('port'));


console.log("hola", app.get('port'));