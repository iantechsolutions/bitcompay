import { createTRPCRouter, protectedProcedure } from "../trpc";
import  fs  from "fs";
import z from "zod";
// a partir de 


export const afipRouter = createTRPCRouter({
    createPDF: protectedProcedure.query(async () => {
      const html = fs.readFileSync("http:/localhost:3000/dashboard/factura/bill.html", "utf8");
      return html;
    }),
  });

// export const afipRouter = createTRPCRouter({
//     createPDF: protectedProcedure
//       .input(
//         z.object({
//           filePath: z.string(),
//         }),
//       )
//       .query(async ({ input }) => {
//         console.log("aca esta el error?")
//         console.log(input.filePath)
//         const html = fs.readFileSync(input.filePath, "utf8");
//         return html;
//       }),
//   });