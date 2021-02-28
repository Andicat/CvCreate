import React from 'react';
import PropTypes from 'prop-types';
import {Transition} from "react-transition-group";
import { NavLink } from 'react-router-dom';

import OptionPanel from './OptionPanel';

import TemplatePanel from './TemplatePanel';
import CvDocument from './CvDocument';

import {connect} from 'react-redux';
import {createTemplates, saveFileJSON, readFileJSON} from './utils';
import {db} from '../App';
import {cv_load} from '../redux/cvDataAC';


class CV extends React.PureComponent {

    static propTypes = {
        transitionClass: PropTypes.string,
        stylePage: PropTypes.object,  
        blocks: PropTypes.array,
        activeBlocksId: PropTypes.array,
    };

    state = {
        showPanel: true,
    }

    saveCV = () => {
        let stateToSave = {style:this.props.stylePage,blocks:this.props.blocks};
        saveFileJSON(JSON.stringify(stateToSave),'CV','.json');
    }

    onLoadCV = (data) => {
        this.props.dispatch(cv_load(data.blocks,data.style));
    }

    loadCV = (evt) => {
        readFileJSON(evt.target.files[0],this.onLoadCV);
        evt.target.value = null;
    }

    showHTML = () => {
        let cvBlock = document.querySelector('.cv');
        let cvStyle = document.getElementsByTagName('style')[0];
        let styleTag = document.createElement('style');
        styleTag.setAttribute('type','text/css');
        if (styleTag.styleSheet){
            styleTag.styleSheet.cssText = cvStyle.innerHTML;
        } else {
        styleTag.appendChild(document.createTextNode(cvStyle.innerHTML));
        }
        
        var windowCV = window.open('', 'wnd');
        let headTag = windowCV.document.head;
        headTag.appendChild(styleTag);
        windowCV.document.body.innerHTML = cvBlock.outerHTML;
        windowCV.document.body.style.overflow = 'auto';
        windowCV.document.body.style.height = 'auto';
    }

    showPanel = () => {
        this.setState({showPanel:!this.state.showPanel});
    }
    
    render () {
        //console.log('render cv');
        let activeOneId = (this.props.activeBlocksId.length===1) && this.props.activeBlocksId[0];
        let activeBlock = null;
        if (activeOneId) {
            activeBlock = this.props.blocks.find(b => b.id === activeOneId);
        }

        //<button className='header__button header__button--html' onClick={this.showHTML}>Show</button>

        return (
            <React.Fragment>
                <header className={'header ' + this.props.transitionClass}>
                    <span className='header__logo'>Create your CV</span>
                    <ul className='header__menu'>
                        <li className='header__menu-item'>
                            <button className='header__button header__button--save' onClick={this.saveCV}>Save</button>
                        </li>
                        <li className='header__menu-item'>
                            <input type='file' name='file-cv' id='file-cv' className='option__file' accept='text/*' onChange={this.loadCV}></input>
                            <label className='header__button header__button--load' htmlFor='file-cv' data-tooltip={true}>Load</label>
                        </li>
                        <li className='header__menu-item'>
                            <NavLink to='/view' className='header__button header__button--html'>Show</NavLink>    
                        </li>
                    </ul>
                </header>
                <main className={'main ' + this.props.transitionClass}>
                    <div className='template-panel'>
                        <Transition in={this.state.showPanel} unmountOnExit timeout={{ enter: 500, exit: 500 }}>
                            {stateName => {
                                return <TemplatePanel transitionClass={stateName} groups={createTemplates()}/>
                            }}
                        </Transition>
                        {this.state.showPanel && null}
                        <button className='template-panel__button-hide' onClick={this.showPanel}/>
                    </div>
                    <div className='desk'>
                        <OptionPanel activeBlockGroup={activeBlock?activeBlock.group:false} activeBlockLink={activeBlock?activeBlock.link:''} activeBlockId={activeBlock?activeBlock.id:false} activeBlockLock={activeBlock?activeBlock.lock:false}/>
                        <CvDocument activeBlock={activeBlock} stylePage={this.props.stylePage} showPanel={this.state.showPanel}/>
                    </div>
                </main>
            </React.Fragment>
        );
    }
}

const mapStateToProps = function (state) {
    return {
        stylePage: state.cvData.stylePage,
        blocks: state.cvData.blocks,
        activeBlocksId: state.cvData.activeBlocksId,
    };
};
  
export default connect(mapStateToProps)(CV);
