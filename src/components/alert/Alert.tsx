import styled from "styled-components";
import {useEffect, useRef} from "react";

const Wrapper = styled.div`
  min-width: 200px;
  padding: 16px;
  margin: 16px;
  color: white;
  background-color: #1c1c1e;
  border: none;
  border-radius: 8px;
  
  position: fixed;
  bottom: 0px;
  right: 0px;
`;

interface AlertProps {
    text: string
}

const Alert = ({text}: AlertProps) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const reference = ref!!.current!!;
        let ms = 0;
        let opacity = 1.0;
        reference.style.opacity = opacity.toString();

        const id = setInterval(() => {
            console.log(opacity)
            if (ms > 3000) {
                opacity = (Math.cos(Math.PI * ((ms - 3000) / 2000)) + 1) / 2;
            } else if (ms > 5000 || opacity <= 0) {
                clearInterval(id);
            }
            ms += 50;
        }, 50);

        reference.style.opacity = opacity.toString();
    }, []);

    return (
        <Wrapper ref={ref}>{text}</Wrapper>
    )
}

export default Alert;