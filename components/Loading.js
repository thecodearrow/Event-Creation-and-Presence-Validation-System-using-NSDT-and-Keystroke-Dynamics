import React from 'react';

export default function (props){
    return (
        <div style={{height: '100vh',textAlign:'center',backgroundColor:'rgba(0,0,0,0.9)',color:'white',position:'absolute',width:'100vw'}}>
            <h1 style= {{
                fontSize:'3rem',
                fontFamily:'Roboto',
                letterSpacing: '3px',
                fontWeight: '100',
                textAlign:'center',
                position: 'relative',
                transform:'translateY(-50%)',
                top: '50%'
            }}
            >
                Loading...
            </h1>
        </div>
    )
}