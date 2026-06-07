import { Children, type ReactNode } from "react";

type ListAreaProps = {
  children: ReactNode;
  emptyText: string;
};

function ListArea({ children, emptyText }: ListAreaProps) {
  const hasChildren = Children.count(children) > 0;

  return (
    <div className="list-area">
      {hasChildren ? children : <p className="empty-text">{emptyText}</p>}
    </div>
  );
}

export default ListArea;