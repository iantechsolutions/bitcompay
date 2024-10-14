import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { api } from "~/trpc/server";
import { isClipEffect } from "html2canvas/dist/types/render/effects";

export const healthInsurancesRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ healthInsuranceId: z.string() }))
    .query(async ({ input, ctx }) => {
      const healthInsurance_found = await db.query.healthInsurances.findFirst({
        where: and(
          eq(schema.healthInsurances.id, input.healthInsuranceId),
          eq(schema.healthInsurances.companyId, ctx.session.orgId!)
        ),
        with: {
          cpData: true,
          aportes_os: true,
        },
      });
      return healthInsurance_found;
    }),
  getWithComprobantes: protectedProcedure
    .input(z.object({ healthInsuranceId: z.string() }))
    .query(async ({ input, ctx }) => {
      const healthInsurance_found = await db.query.healthInsurances.findFirst({
        where: and(
          eq(schema.healthInsurances.id, input.healthInsuranceId),
          eq(schema.healthInsurances.companyId, ctx.session.orgId!)
        ),
        with: {
          comprobantes: true,
          cc: true,
          cpData: true,
          aportes_os: true,

          // {
          // with:{
          //   items:true
          // }
          // }
        },
      });
      return healthInsurance_found;
    }),
  // getWithComprobantesNonClient: protectedProcedure
  //   .input(z.object({ healthInsuranceId: z.string() }))
  //   .query(async ({ input, ctx }) => {
  //     const healthInsurance_found = await db.query.healthInsurances.findFirst({
  //       where: and(
  //         eq(schema.healthInsurances.id, input.healthInsuranceId),
  //         eq(schema.healthInsurances.companyId, ctx.session.orgId!),
  //         eq(schema.healthInsurances.isClient, false)
  //       ),
  //       with: {
  //         comprobantes: true,
  //         cc: true,
  //         cpData: true,
  //         affiliate_os: true,

  //         // {
  //         // with:{
  //         //   items:true
  //         // }
  //         // }
  //       },
  //     });
  //     return healthInsurance_found;
  //   }),
  // const [initials, setInitials] = useState(OS?.initials ?? "");
  //   const [businessUnit, setBusinessUnit] = useState(OS?.businessUnit ?? "");
  //   const [businessName, setBusinessName] = useState(OS?.businessName ?? "");
  //   const [fiscalAddress, setFiscalAddress] = useState(OS?.fiscalAddress ?? "");
  //   const [fiscalFloor, setFiscalFloor] = useState(OS?.fiscalFloor ?? "");
  //   const [fiscalOffice, setFiscalOffice] = useState(OS?.fiscalOffice ?? "");
  //   const [fiscalLocality, setFiscalLocality] = useState(OS?.fiscalLocality ?? "");
  //   const [fiscalProvince, setFiscalProvince] = useState(OS?.fiscalProvince ?? "");
  //   const [fiscalPostalCode, setFiscalPostalCode] = useState(OS?.fiscalPostalCode ?? "");
  //   const [fiscalCountry, setFiscalCountry] = useState(OS?.fiscalCountry ?? "");
  //   const [IIBBStatus, setIIBBStatus] = useState(OS?.IIBBStatus ?? "");
  //   const [IIBBNumber, setIIBBNumber] = useState(OS?.IIBBNumber ?? "");
  //   const [sellCondition, setSellCondition] = useState(OS?.sellCondition ?? "");
  //   const [phoneNumber, setPhoneNumber] = useState(OS?.phoneNumber ?? "");
  //   const [email, setEmail] = useState(OS?.email ?? "");
  //   const [state, setState] = useState(OS?.state ?? "");
  //   const [user, setUser] = useState(OS?.user ?? "");
  //   const [cancelMotive, setCancelMotive] = useState(OS?.cancelMotive ?? "");
  //   const [floor, setFloor] = useState(OS?.floor ?? "");
  //   const [office, setOffice] = useState(OS?.office ?? "");
  //   const [dateState, setDateState] = useState<Date | undefined>(OS?.dateState);
  list: protectedProcedure.query(async ({ input, ctx }) => {
    const companyId = ctx.session.orgId;
    const healthInsurances = await db.query.healthInsurances.findMany({
      where: eq(schema.healthInsurances.companyId, companyId!),
      with: { cpData: true, aportes_os: true },
    });
    return healthInsurances;
  }),
  listClient: protectedProcedure.query(async ({ input, ctx }) => {
    const companyId = ctx.session.orgId;
    const healthInsurances = await db.query.healthInsurances.findMany({
      where:
       and(
        eq(schema.healthInsurances.companyId, companyId!),
        eq(schema.healthInsurances.isClient, false)
       ),
      with: { cpData: true, aportes_os: true },
    });
    return healthInsurances;
  }),
  listNonClient: protectedProcedure.query(async ({ input, ctx }) => {
    const companyId = ctx.session.orgId;
    const healthInsurances = await db.query.healthInsurances.findMany({
      where: and(
        eq(schema.healthInsurances.isClient, false),
        eq(schema.healthInsurances.companyId, companyId!)
      ),
      with: { cpData: true, aportes_os: true },
    });
    return healthInsurances;
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        identificationNumber: z.string(),
        adress: z.string().optional(),
        description: z.string().optional(),
        afip_status: z.string().optional(),
        fiscal_id_number: z.string().optional(),
        fiscal_id_type: z.string().optional(),
        isClient: z.boolean(),
        responsibleName: z.string().optional(),
        locality: z.string().optional(),
        province: z.string().optional(),
        postal_code: z.string().optional(),
        initialValue: z.string().optional(),
        initials: z.string(),
        businessUnit: z.string().optional(),
        businessName: z.string().optional(),
        fiscalAddress: z.string().optional(),
        fiscalFloor: z.string().optional(),
        fiscalOffice: z.string().optional(),
        fiscalLocality: z.string().optional(),
        fiscalProvince: z.string().optional(),
        fiscalPostalCode: z.string().optional(),
        fiscalCountry: z.string().optional(),
        IIBBStatus: z.string().optional(),
        IIBBNumber: z.string().optional(),
        sellCondition: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().optional(),
        state: z.string().optional(),
        user: z.string().optional(),
        cancelMotive: z.string().optional(),
        floor: z.string().optional(),
        office: z.string().optional(),
        dateState: z.date().optional(),
        excelDocument: z.string().optional(),
        excelAmount: z.string().optional(),
        excelEmployerDocument: z.string().optional(),
        excelSupportPeriod: z.string().optional(),
        excelContributionperiod: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const companyId = ctx.session.orgId;
      const new_healthInsurance = await db
        .insert(schema.healthInsurances)
        .values({
          companyId,
          name: input.name ?? "",
          identificationNumber: input.identificationNumber,
          adress: input.adress,
          description: input.description,
          afip_status: input.afip_status,
          fiscal_id_number: input.fiscal_id_number,
          fiscal_id_type: input.fiscal_id_type,
          isClient: input.isClient,
          responsibleName: input.responsibleName,
          locality: input.locality,
          province: input.province,
          postal_code: input.postal_code,
          initials: input.initials,
          businessUnit: input.businessUnit,
          businessName: input.businessName,
          fiscalAddress: input.fiscalAddress,
          fiscalFloor: input.fiscalFloor,
          fiscalOffice: input.fiscalOffice,
          fiscalLocality: input.fiscalLocality,
          fiscalProvince: input.fiscalProvince,
          fiscalPostalCode: input.fiscalPostalCode,
          fiscalCountry: input.fiscalCountry,
          IIBBStatus: input.IIBBStatus,
          IIBBNumber: input.IIBBNumber,
          sellCondition: input.sellCondition,
          phoneNumber: input.phoneNumber,
          email: input.email,
          state: input.state,
          user: input.user,
          cancelMotive: input.cancelMotive,
          floor: input.floor,
          office: input.office,
          dateState: input.dateState,
          excelDocument: input.excelDocument,
          excelAmount: input.excelAmount,
          excelEmployerDocument: input.excelEmployerDocument,
          excelSupportPeriod: input.excelSupportPeriod,
          excelContributionperiod: input.excelContributionperiod,
        })
        .returning();

      console.log("Tortuga", input.initialValue);
      const cc = await db
        .insert(schema.currentAccount)
        .values({
          company_id: companyId,
          family_group: "",
          health_insurance: new_healthInsurance[0]?.id ?? "",
        })
        .returning();
      const firstEvent = await db.insert(schema.events).values({
        current_amount: parseInt(input?.initialValue ?? "0"),
        description: "Apertura",
        event_amount: parseInt(input?.initialValue ?? "0"),
        currentAccount_id: cc[0]?.id,
        type: "REC",
      });
      return new_healthInsurance;
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        identificationNumber: z.string().optional(),
        adress: z.string().optional(),
        description: z.string().optional(),
        afip_status: z.string().optional(),
        fiscal_id_number: z.string().optional(),
        fiscal_id_type: z.string().optional(),
        isClient: z.boolean().optional(),
        responsibleName: z.string().optional(),
        locality: z.string().optional(),
        province: z.string().optional(),
        postal_code: z.string().optional(),
        initialValue: z.string().optional(),
        initials: z.string().optional(),
        businessUnit: z.string().optional(),
        businessName: z.string().optional(),
        fiscalAddress: z.string().optional(),
        fiscalFloor: z.string().optional(),
        fiscalOffice: z.string().optional(),
        fiscalLocality: z.string().optional(),
        fiscalProvince: z.string().optional(),
        fiscalPostalCode: z.string().optional(),
        fiscalCountry: z.string().optional(),
        IIBBStatus: z.string().optional(),
        IIBBNumber: z.string().optional(),
        sellCondition: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().optional(),
        state: z.string().optional(),
        user: z.string().optional(),
        cancelMotive: z.string().optional(),
        floor: z.string().optional(),
        office: z.string().optional(),
        dateState: z.date().optional(),
        excelDocument: z.string().optional(),
        excelAmount: z.string().optional(),
        excelEmployerDocument: z.string().optional(),
        excelSupportPeriod: z.string().optional(),
        excelContributionperiod: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const healthInsurance_changed = await db
        .update(schema.healthInsurances)
        .set({
          name: input.name,
          identificationNumber: input.identificationNumber,
          adress: input.adress,
          afip_status: input.afip_status,
          fiscal_id_number: input.fiscal_id_number,
          fiscal_id_type: input.fiscal_id_type,
          isClient: input.isClient,
          responsibleName: input.responsibleName,
          locality: input.locality,
          province: input.province,
          postal_code: input.postal_code,
          initials: input.initials,
          businessUnit: input.businessUnit,
          businessName: input.businessName,
          fiscalAddress: input.fiscalAddress,
          fiscalFloor: input.fiscalFloor,
          fiscalOffice: input.fiscalOffice,
          fiscalLocality: input.fiscalLocality,
          fiscalProvince: input.fiscalProvince,
          fiscalPostalCode: input.fiscalPostalCode,
          fiscalCountry: input.fiscalCountry,
          IIBBStatus: input.IIBBStatus,
          IIBBNumber: input.IIBBNumber,
          sellCondition: input.sellCondition,
          phoneNumber: input.phoneNumber,
          email: input.email,
          state: input.state,
          user: input.user,
          cancelMotive: input.cancelMotive,
          floor: input.floor,
          office: input.office,
          dateState: input.dateState,
          excelDocument: input.excelDocument,
          excelAmount: input.excelAmount,
          excelEmployerDocument: input.excelEmployerDocument,
          excelSupportPeriod: input.excelSupportPeriod,
          excelContributionperiod: input.excelContributionperiod,
        })
        .where(eq(schema.healthInsurances.id, input.id));
      return healthInsurance_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ healthInsuranceId: z.string() }))
    .mutation(async ({ input }) => {
      const healthInsurance_deleted = await db
        .delete(schema.healthInsurances)
        .where(eq(schema.healthInsurances.id, input.healthInsuranceId));

      return healthInsurance_deleted;
    }),
});
