export const querys = {
  obtenerUltimaTransaccion: "SELECT TOP (1) * FROM Monedero_Trans WHERE Id_Monedero = @Id_Monedero ORDER BY Id_Trans DESC",
  insertMonederoDb: "INSERT INTO Monedero_Trans (Id_Cliente, FechaHora, TipoMov, Id_Monedero, Monto, Transaccion) VALUES (@Id_Cliente,@FechaHora,@TipoMov,@Id_Monedero,@Monto,@Transaccion);",
};