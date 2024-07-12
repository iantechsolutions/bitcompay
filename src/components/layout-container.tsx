export default function LayoutContainer(props: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[1000px] space-y-5 overflow-visible">
      {props.children}
    </div>
  );
}
