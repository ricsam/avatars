import React, { useMemo, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { useQuery, gql } from '@apollo/client';

function App() {
  const layersQuery = useQuery(gql`
    query layers {
      layers {
        id
        title
        variants {
          id
          title
        }
      }
    }
  `)
  const [choices, setChoices] = useState<{[k: string]: string}>({});
  const avatar = useMemo(() => {
    if (!layersQuery.data?.layers) {
      return [];
    }
    const layers = layersQuery.data.layers;
    const picture: string[] = [];
    layers.forEach((layer: any) => {
      if (choices[layer.id]) {
        picture.push(choices[layer.id])
      } else {
        picture.push(layer.variants[0].id)
      }
    })
    return picture;
  }, [choices, layersQuery]);
  if (layersQuery.loading) {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
  return <div>
    <div style={{paddingBottom: '16px'}}>

    
    <div style={{position: 'relative', width: 207  ,
        height: 297}}>
    {avatar.map((id, index) => {
      return <div key={index} style={{
        backgroundImage: `url(${process.env.REACT_APP_IMG || 'http://localhost:4000/img'}/${id})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        width: 207  ,
        height: 297,
        position: 'absolute',
        top: 0,
        left: 0,
      }}></div>
    })}
    </div>
    </div>
    {layersQuery.data.layers.map((layer: any) => {
      const value = choices[layer.id] || layer.variants[0].id;
      return (

        <FormControl>
        <InputLabel id={layer.id}>{layer.title}</InputLabel>
        <Select
          labelId={layer.id}
          value={value}
          onChange={(ev) => {
            setChoices({
              ...choices,
              [layer.id]: ev.target.value,
            })
          }}
        >
          {layer.variants.map((variant: any) => {
            return <MenuItem value={variant.id} key={variant.id}>{variant.title}</MenuItem>
          })}
        </Select>
      </FormControl>
      );
    })}
  </div>
}

export default App;
