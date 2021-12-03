import styles from '../styles/pages/Ad.module.scss';
import { environment } from '../common/environment';

import type { NextPage } from 'next';
import { SyntheticEvent } from 'react'
import { useRef, useReducer } from 'react'

import * as R from 'ramda';

const PROJECT = environment.appName;
const FILE = 'ad.tsx';

interface IState {
  images: any[];
}
interface IAction {
  type: 'addImage';
  payload: any[]; 
}

let initialState: IState = {
  images: [],
}

function reducer(state: ISstate, action: IAction) {
  const FUNC = 'reducer()'
  switch (action.type) {
    case 'addImage': 
      state.images = [...state.images, action.payload]; 
      break;
    default:
      console.error(`${PROJECT}:${FILE}:${FUNC}: unknown action type: ${action.type}`);
  }
  return R.clone(state);
}

const Ad: NextPage = () => {

  let fileInputRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  function handleOnFileChange(event: SyntheticEvent) {
    let images = R.reduce((a, file) => {
      a.push(URL.createObjectURL(file));
      return a;
    }, [], event.currentTarget.files) 
    dispatch({
      type: 'addImage',
      payload: images,
    });
  }


  function images() {
    return R.reduce((a, src) => {
      a.push(<img src={src}/>)
      return a;
    }, [], state.images)
  }


  return (
    <div className={styles.formContainer}>
      <h1 className={styles.mainHeader}> Vložiť inzerát </h1>
      <div className={styles.categoryBox}>
        <select className={styles.category} name="category">
          <option> kategoria1</option>
          <option> kategoria2</option>
        </select>
        <select className={styles.subCategory} name="subCategory">
          <option> sub kategoria1</option>
          <option> sub kategoria2</option>
        </select>
      </div>
      <div className={styles.adTitleBox}>
        <div className={styles.title}>
          <label htmlFor="title"> Názov </label>
          <input type="text" name="title"></input>
        </div>
      </div>
      <div className={styles.imagesBox}>
        <input type="file" className={styles.hiddenFileInput} ref={fileInputRef} multiple accept="image/*" onChange={handleOnFileChange} ></input>
        <div className={styles.button}>
          <a className="btn" onClick={() => fileInputRef.current.click() }> Pridaj obrázky </a>
        </div>
        <div>
          {images()}
        </div>
      </div>
    </div>
  );
};

export default Ad;
