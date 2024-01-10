export default function LayoutContainer(props: {children: React.ReactNode}) {
    return <div className="space-y-2 max-w-[620px] w-full">
        {props.children}
    </div>
}