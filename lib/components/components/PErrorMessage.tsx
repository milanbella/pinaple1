

import { useState } from 'react';

export interface IProps {
  message: string;
}


const PErrorMessage = (props: IProps) => {
  const [isShowing, setIsShowing] = useState(true);
  if (isShowing === true) { 
    return (
      <div className="PErrorMessage-container">
        {props.message}
        <span className="PErrorMessage-closeButton" onClick={() => setIsShowing(false)}>&times;</span>
      </div>
    );
  } else {
    return (
      null
    )
  }
};

export default PErrorMessage;
