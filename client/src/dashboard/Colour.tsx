import * as React from 'react';


interface ColorProps {
  color: String
}

export default function Color(props: ColorProps) {

  return (
    <div style={{color: "#"+props.color,backgroundColor: "#"+props.color }}>
        #{props.color}
    </div>
  );
}
