import React, { FC, Fragment } from "react";

const FluidLayout: FC<{ children?: JSX.Element }> = (props) => {
  return (
    <Fragment>
      <div className="justify-center space-y-4 bg-base-200 pt-4">
        {props.children}
      </div>
    </Fragment>
  );
};
export default FluidLayout;
