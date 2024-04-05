import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";

export function SidenavSheet(props: {
  trigger: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>{props.trigger}</SheetTrigger>
      <SheetContent side="left" className="max-h-full overflow-y-auto">
        {/* <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you're done.
                    </SheetDescription>
                </SheetHeader> */}
        {props.content}
        {/* <SheetFooter>
                    <SheetClose asChild>
                        <Button type="submit">Save changes</Button>
                    </SheetClose>
                </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
