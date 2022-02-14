export const querys = {
    getProducById: "SELECT * FROM Products Where Id = @Id",
    insertMonederoDb:
      "INSERT INTO Monedero_Trans (Id_Cliente, FechaHora, TipoMov, Id_Monedero, Monto) VALUES (@idCliente,@fechaHora,@tipoMov,@idMonedero,@Monto);",
  };