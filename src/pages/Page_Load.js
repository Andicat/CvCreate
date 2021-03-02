import React from 'react';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import {templates_load} from '../redux/templatesDataAC';
import {cv_load} from '../redux/cvDataAC';

import firebase from '@firebase/app';
import '@firebase/firestore';
import '@firebase/storage';

class Page_Load extends React.PureComponent {

    componentDidMount() {
        this.initializeApp();
        this.loadData();
        window.onbeforeunload = this.beforeUnload;
        window.onhashchange = this.beforeUnload;
    }

    db = null;
    storage = null;

    //уход со страницы    
    beforeUnload = function(evt) {
        debugger
        evt.returnValue = 'А у вас есть несохранённые изменения!';
        this.props.history.push('/');
    }
    
    initializeApp = () => {
        let firebaseConfig = {
            apiKey: 'AIzaSyAq9TFZvy9lyxxV3vrJXGXT5M_Ivwf7-RY',
            authDomain: 'creacv-a2bd7.firebaseapp.com',
            projectId: 'creacv-a2bd7',
            storageBucket: 'creacv-a2bd7.appspot.com',
            messagingSenderId: '1093581926352',
            appId: '1:1093581926352:web:7d1b8619531df14b8253d5',
            measurementId: 'G-08QQHJN47T'
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.firestore();
        this.storage = firebase.storage();
    }

    loadData = async () => {
        //templates
        let loadData = {};
        let loadTemplates = new Promise((resolve) => {
            this.loadFirebase('Templates','blocks',resolve);
        });
        await loadTemplates.then((data) => {
            loadData.templates = data.templates;
            //setTimeout(() => this.props.history.push('/cv'),2000);
        });

        //image
        let loadImage = new Promise((resolve) => {
            this.loadStorage('images/image.svg',resolve);
        });
        await loadImage.then((data) => {
            loadData.image = data;
        });
        this.props.dispatch(templates_load(loadData));
        
        //local storage
        var loadLS= new Promise( (resolve,reject) => {
            var lsName = "CV";
            var ls = localStorage.getItem(lsName);
            if (ls) {
                var data = JSON.parse(ls);
                resolve(data);
            }
            resolve(true);
        });
        await loadLS.then((data) => {
            this.props.dispatch(cv_load(data.blocks,data.style));
        });

        setTimeout(() => this.props.history.push('/cv'),2000);
    }

    //load from firebase
    loadFirebase = async (collectionName,docName,resolve) => {
        this.db.collection(collectionName).doc(docName).get().then((doc) => {
            if (doc.exists) {
                console.log("Document data:", doc.data());
                    resolve(doc.data());
                } else {
                    console.log("No such document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });        
    }

    //load from storage
    loadStorage = async (path,resolve) => {
        const storageRef = this.storage.ref();
        storageRef.child(path).getDownloadURL()
            .then((url) => {
                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = (event) => {
                    var blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();
                
                resolve(url);
            })
            .catch((error) => {
            });
    }

    //временно!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    createTemplates = () => {

        let textStyleDefault = {font:'Roboto', color:'#000000', fontsize:'16',
                                bold:false, italic:false, center:false,
                                uppercase:false, underline:false, padding:{left:1,right:0,top:0,bottom:0}};

        let imagesArr = [
            {type:'image', style:{file:'', opacity:1}},
            {type:'image', style:{file:'', opacity:1, borderRadius:'50%'}},
            {type:'image', style:{file:'', opacity:1, bordercolor: '#E05B49', borderwidth: '3', borderStyle: 'solid'}},
            {type:'image', style:{file:'', opacity:1, borderRadius:'50%', bordercolor: '#E05B49', borderwidth: '3', borderStyle: 'solid'}},
        ];

        let textArr = [
            {type:'text', text:'Text simple', style:{...textStyleDefault, fontsize: '20'}},
            {type:'text', text:'Text with background', style:{bgcolor:'#8e9fa0',...textStyleDefault, fontsize:'14'}},
            {type:'text', text:'Big text', style:{...textStyleDefault, fontsize: '40', bold:true}},
            {type:'group', elements:[
                {type:'text', text:'Your header', style:{...textStyleDefault, fontsize:'20', bold:true}},
                {type:'text', text:'your text', style:{...textStyleDefault}}
            ]},
        ];
        
        let textBlockArr = [
            {type:'group', elements:[
                {type:'text', text:'Your position', style:{...textStyleDefault, fontsize:'18', bold:true}},
                {type:'text', text:'Company', style:{...textStyleDefault, fontsize:'18'}},
                {type:'text', text:'period', style:{...textStyleDefault,italic:true}},
                {type:'text', text:'your competencies and results', style:{...textStyleDefault}}
            ]},
        ];
    
        let figuresArr = [
            {type:'figure', style:{bgcolor:'#E05B49', opacity:1}},
            {type:'figure', style:{bgcolor:'#6AABB5', opacity:1, borderRadius:'50%'}},
        ];
        
        let progressArr = [
            /*{type:'group', direction:'row', elements:[
                {type:'text', text:'skill in dots', style:{...textStyleDefault}},
                {type:'dots-row', style:{maincolor:'#E05B49', addcolor:'#E6E6E6', radius:10, maincount:3, addcount: 2}},
            ]},
            {type:'group', direction:'row', elements:[
                {type:'text', text:'skill in progress', style:{...textStyleDefault}},
                {type:'progress', style:{maincolor:'#E05B49', addcolor:'#E6E6E6', progress:50}},
            ]},
            {type:'group', direction:'column', elements:[
                {type:'text', text:'skill in progress', style:{...textStyleDefault}},
                {type:'progress', style:{maincolor:'#E05B49', addcolor:'#E6E6E6', progress:50}},
            ]},*/
            {type:'dots-row', style:{maincolor:'#E05B49', addcolor:'#E6E6E6', radius:10, maincount:5, addcount: 3}},
            {type:'progress', style:{maincolor:'#E05B49', addcolor:'#E6E6E6', progress:50}}
        ];

        /*let iconsArr = [
            {type:'image', style:{file:icon, opacity:1}},
        ];*/
    
        let templatesArr = [
            {name: 'Images', elements:imagesArr},
            {name: 'Text', elements:textArr},
            {name: 'Info', elements:textBlockArr},
            {name: 'Figures', elements:figuresArr},
            {name: 'Progress', elements:progressArr},
            //{name: 'Icons', elements:iconsArr},
        ];

        return templatesArr;
    }

    saveTemplates = () => {
        let templatesArr = this.createTemplates();
        this.saveFirebase('Templates','blocks',{templates:templatesArr});
    }

    //save data in firebase
    saveFirebase = (collectionName,docName,data) => {
        this.db.collection(collectionName).doc(docName).set(data)
            .then(() => {
                console.log("Document successfully written!");
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            });
    }

    render() {
        return <div className='loader'>
                    <span className='loader__text'>Loading</span>
                    <i className='loader__layer loader__layer--1'></i>
                    <i className='loader__layer loader__layer--2'></i>
                    <i className='loader__layer loader__layer--3'></i>
               </div>;
    }
}

export default connect()(withRouter(Page_Load));
    