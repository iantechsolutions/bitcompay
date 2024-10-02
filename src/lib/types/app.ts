export type TotalsType = {
    subTotal: number;
    iva: number;
    otherAttributes: number;
  };
  
 export type ManualGenInputs = {
    puntoVenta: string;
    tipoDeConcepto: string;
    alicuota: string;
    dateEmision: Date;
    dateVencimiento: Date;
    dateDesde: Date;
    dateHasta: Date;
    facturasEmitidas: Number;
  };
 export type ConceptsForm = {
    concepts: {
      concepto: string;
      importe: number;
      iva: number;
      total: number;
    }[];
  };
 export type OtherTributesForm = {
    tributes: {
      tribute: string;
      jurisdiccion: string;
      base: number;
      aliquot: number;
      amount: number;
    }[];
  };
  
 export type otherConceptsForm = {
    otherConcepts: {
      description: string;
      importe: number;
    }[];
  };
  
 export type AsociatedFCForm = {
    comprobantes: {
      tipoComprobante: string;
      puntoVenta: string;
      nroComprobante: string;
      dateEmision: Date | null;
      importe?: number; 
      iva?: number;
    }[];
  };