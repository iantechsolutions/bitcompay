export default function LayoutContainer(props: {children: React.ReactNode}) {
    return <div className="space-y-5 max-w-[800px] w-full">
        {props.children}
    </div>
}