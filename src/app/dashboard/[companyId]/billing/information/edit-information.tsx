


"use client";

import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { DialogFooter, DialogHeader, Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";

export default function EditCompanie(props: { params: { companyId: string } }) {
    const { data: company, isLoading: isLoadingCompany, error: companyError } = api.companies.get.useQuery({
        companyId: props.params.companyId,
    });

    const [cuit, setCuit] = useState("");
    const [afipKey, setAfipKey] = useState("");
    const [razon_social, setRazonSocial] = useState("");
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (company) {
            setCuit(company.cuit || "");
            setAfipKey(company.afipKey || "");
            setRazonSocial(company.razon_social || "");
        }
    }, [company]);

    const { mutateAsync: Companie, isLoading: isMutating } = api.companies.change.useMutation();

    const handleSubmit = async () => {
        try {
            await Companie({
                companyId: props.params.companyId,
                cuit,
                afipKey,
                razon_social,
            });
            setOpen(false); // Close the dialog on success
        } catch (error) {
            setError("error");
        }
    };

    if (isLoadingCompany) {
        return <div>Loading...</div>;
    }

    if (companyError) {
        return <div>Error loading company data</div>;
    }

    return (
        <>
            <Button onClick={() => setOpen(true)}>
                <PlusCircleIcon className="mr-2" /> Editar datos de la compañia
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Ingrese los datos</DialogTitle>
                    </DialogHeader>
                    <div>
                        <Label htmlFor="cuit">Cuit</Label>
                        <Input
                            id="cuit"
                            placeholder="Enter CUIT"
                            value={cuit}
                            onChange={(e) => setCuit(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="afipKey">Clave fiscal</Label>
                        <Input
                            id="afipKey"
                            placeholder="Enter AFIP Key"
                            value={afipKey}
                            onChange={(e) => setAfipKey(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="razonSocial">Razon social</Label>
                        <Input
                            id="razonSocial"
                            placeholder="Enter Razon Social"
                            value={razon_social}
                            onChange={(e) => setRazonSocial(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button disabled={isMutating} onClick={handleSubmit}>
                            {isMutating && (
                                <Loader2Icon className="mr-2 animate-spin" size={20} />
                            )}
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {error && <div className="error">{error}</div>}
        </>
    );
}





