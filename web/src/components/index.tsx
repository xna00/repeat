import type { FC, PropsWithChildren } from "react";
import { createPortal } from "react-dom";

type Placement = "left" | "right" | "top" | "bottom";
const Drawer: FC<
  PropsWithChildren<{
    visible: boolean;
    onClose: () => void;
    placement?: Placement;
  }>
> = ({ visible, onClose, placement = "left", children }) => {
  const transformMap: Record<Placement, string> = {
    left: "translate3d(-100%, 0, 0)",
    right: "translate3d(100%, 0, 0)",
    top: "translateY(-100%)",
    bottom: "translateY(100%)",
  };
  const flexDirectionMap: Record<Placement, string> = {
    left: "row",
    right: "row-reverse",
    top: "column",
    bottom: "column-reverse",
  };

  return (
    <>
      {createPortal(
        <aside
          className={`w-[100vw] h-full fixed flex top-0 ${
            visible
              ? // bg or inset box-shadow
                "bg-black bg-opacity-60"
              : "bg-transparent bg-opacity-0"
          }`}
          style={{
            transform: visible
              ? "translate3d(0, 0, 0)"
              : transformMap[placement],
            flexDirection: flexDirectionMap[placement] as any,
            transition: `background 200ms ease, transform 0ms ease ${
              !visible ? "200ms" : "0ms"
            }`,
          }}
          onClick={(e) => {
            e.target === e.currentTarget && onClose();
          }}
        >
          <div
            style={{
              transform: visible
                ? "translate3d(0, 0, 0)"
                : transformMap[placement],
              transition: `box-shadow 200ms ease, background 200ms ease, transform 200ms`,
            }}
          >
            {children}
          </div>
        </aside>,
        document.body
      )}
    </>
  );
};

export default Drawer;
