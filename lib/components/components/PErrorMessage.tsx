

import { useState } from 'react';

export interface IProps {
  message: string;
  onClose: () => void;
}


const PErrorMessage = (props: IProps) => {
  const [isShowing, setIsShowing] = useState(true);

  let onClickFn = () => {
    setIsShowing(false);
    if (props.onClose) {
      props.onClose();
    }
  }

  if (isShowing === true) { 
    return (
      <div className="PErrorMessage-container">
        {props.message}
        <span className="PErrorMessage-closeButton" onClick={onClickFn}>&times;</span>
      </div>
    );
  } else {
    return (
      null
    )
  }
};

export default PErrorMessage;
