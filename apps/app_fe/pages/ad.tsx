import styles from '../styles/pages/Ad.module.scss';
import { environment } from '../common/environment';

import type { NextPage } from 'next';
import { SyntheticEvent } from 'react'
import { useRef, useReducer } from 'react'

import * as R from 'ramda';

const PROJECT = environment.appName;
const FILE = 'ad.tsx';

interface IImage {
  src: any;
  file: any;
}

interface IState {
  images: any[];
}
interface IAction {
  type: 'addImage' | 'removeImage' ;
  payload: any; 
}

let initialState: IState = {
  images: [],
}

function reducer(state: ISstate, action: IAction): IState {
  const FUNC = 'reducer()'
  if (action.type === 'addImage') {
    let images = R.map(v => {
      let image: IImage = {
        src: v.src,
        file: v.file,
      }
      return image;
    })(action.payload)
    return {
      ...state,
      images: R.concat(state.images, images),
    }
  } else if (action.type === 'removeImage') {
    let idx = action.payload;
    return {
      ...state,
      images: R.remove(idx, 1, state.images)
    }
  } else {
    console.error(`${PROJECT}:${FILE}:${FUNC}: unknown action type: ${action.type}`);
  }
}

const Ad: NextPage = () => {

  let fileInputRef = useRef(null);
  const [state, dispatch] = useReducer(reducer, initialState);

  function handleOnFileChange(event: SyntheticEvent) {

    let images = R.reduce((a, file) => {

      a.push({
        src: URL.createObjectURL(file),
        file: file,
      });
      return a; 

    }, [], event.currentTarget.files) 
    dispatch({
      type: 'addImage',
      payload: images,
    });
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@ cp 100: fileInputRef');
    console.dir(fileInputRef)
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    fileInputRef.current.value = ''; //@@@@@@@@@@@@@@@@
  }


  function images() {
    return R.addIndex(R.reduce)((a, image: IImage, idx) => {
      function remove() {
        dispatch({
          type: 'removeImage',
          payload: idx,
        });
      }
      a.push(
        <div className={styles.imageBox} key={idx}>
          <img src={image.src}/>
          <span className={styles.removeImageIcon}><i className="lni lni-trash-can lni-lg" onClick={remove}></i></span>
        </div>
      )
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
      <div className={styles.addImagesBox}>
        <label className={styles.boxLabel}>Pridaj obrázky </label> <span className={styles.addImageIcon}><i className="lni lni-image lni-lg" onClick={() => fileInputRef.current.click()}></i></span>
        <div className={styles.imagesBox}>
          <input type="file" className={styles.hiddenFileInput} ref={fileInputRef} multiple accept="image/*" onChange={handleOnFileChange} ></input>
          <div>
            {images()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ad;
