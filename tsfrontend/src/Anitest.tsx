import { useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import './App.css'; // We'll define our CSS transitions here

const FadeComponent = () => {
  const [show, setShow] = useState(false);

  const toggleShow = () => {
    setShow((prevState) => !prevState);
  };

  return (
    <div>
      <button onClick={toggleShow}>
        {show ? 'Hide' : 'Show'} Component
      </button>

      <CSSTransition
        timeout={300} 
        classNames="fade" 
      >
        <div>
          <p>This is a fade-in/out element.</p>
        </div>
      </CSSTransition>
    </div>
  );
};

export default FadeComponent;
