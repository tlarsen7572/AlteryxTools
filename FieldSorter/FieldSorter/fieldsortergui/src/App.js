import React, { Component } from 'react';
import './App.css';
 import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

function getUnmatchedFields() {
    let unmatchedFields = [];
    let incomingFields = window.FieldSorter.incomingFields;
    let sortedFields = window.FieldSorter.sortedFields;

    for (let iIn = 0; iIn < incomingFields.length; iIn++) {
        let isFound = false;

        for (let iSorted = 0; iSorted < sortedFields.length; iSorted++) {
            let matcher = sortedFields[iSorted];
            let searchFor = matcher.isPattern ? new RegExp("^" + matcher.text + "$", "i") : matcher.text;

            if (incomingFields[iIn].strName.search(searchFor) >= 0) {
                isFound = true;
                break;
            }
        }

        if (!isFound) {
            unmatchedFields.push(incomingFields[iIn]);
        }
    }
    return unmatchedFields;
}

class App extends Component {
    constructor(props) {
        super(props);
        this.addUnsorted = this.addUnsorted.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.selectAllSorted = this.selectAllSorted.bind(this);
        this.selectNoneSorted = this.selectNoneSorted.bind(this);
        this.deleteSorted = this.deleteSorted.bind(this);
        this.selectAllUnmatched = this.selectAllUnmatched.bind(this);
        this.selectNoneUnmatched = this.selectNoneUnmatched.bind(this);
        this.addSortedManually = this.addSortedManually.bind(this);
        this.textboxEnterKeyHandler = this.textboxEnterKeyHandler.bind(this);
    }

    unmatchedFields = [];
    addErrorVisibility = 'collapse';

    textboxEnterKeyHandler(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            this.addSortedManually();
        }
    }

    addSortedManually(){
        let textbox = document.getElementById("NewSortedText");
        let isPattern = document.getElementById("NewSortedIsPattern");

        if (textbox.value === ''){
            this.addErrorVisibility = 'visible';
        } else {
            this.addErrorVisibility = 'collapse';
            window.FieldSorter.sortedFields.push({
               text: textbox.value,
               isPattern: isPattern.checked,
               selected: false,
            });
            textbox.value = '';
        }

        this.forceUpdate();
    }

    selectAllUnmatched() {
        let unsorted = document.getElementById("Unsorted");

        for (let i = 0; i < unsorted.options.length; i++) {
            unsorted.options[i].selected = true;
        }
    }

    selectNoneUnmatched() {
        let unsorted = document.getElementById("Unsorted");

        for (let i = 0; i < unsorted.options.length; i++) {
            unsorted.options[i].selected = false;
        }
    }

    selectAllSorted() {
        for (let i = 0; i < window.FieldSorter.sortedFields.length; i++) {
            window.FieldSorter.sortedFields[i].selected = true;
        }
        this.forceUpdate();
    }

    selectNoneSorted() {
        for (let i = 0; i < window.FieldSorter.sortedFields.length; i++) {
            window.FieldSorter.sortedFields[i].selected = false;
        }
        this.forceUpdate();
    }

    deleteSorted() {
        for (let i = window.FieldSorter.sortedFields.length - 1; i >= 0; i--) {
            if (window.FieldSorter.sortedFields[i].selected) {
                window.FieldSorter.sortedFields.splice(i, 1);
            }
        }

        this.unmatchedFields = getUnmatchedFields();
        this.forceUpdate();
    }

    onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        window.FieldSorter.sortedFields = reorder(
            window.FieldSorter.sortedFields,
            result.source.index,
            result.destination.index,
        );

        this.forceUpdate();
    }

    addUnsorted() {
        let unsorted = document.getElementById("Unsorted");

        for (let i = 0; i < unsorted.options.length; i++) {
            let option = unsorted.options[i];
            if (option.selected) {
                window.FieldSorter.sortedFields.push({
                    text: option.text,
                    isPattern: false
                });
            }
        }

        this.unmatchedFields = getUnmatchedFields();
        this.forceUpdate();
    };

    render() {
        this.unmatchedFields = getUnmatchedFields();

        let displaySize = Math.min(20,this.unmatchedFields.length);

        return (
            <div className="App">
                <div>Unsorted fields</div>
                <div>
                    <button className="CoreButton EndButton" type="button" onClick={this.selectAllUnmatched} >All</button>
                    <button className="CoreButton MiddleButton" type="button" onClick={this.selectNoneUnmatched} >None</button>
                    <button className="CoreButton EndButton" type="button" onClick={this.addUnsorted} >Add Selected</button>
                </div>
                <div>
                    <select id="Unsorted" className="UnmatchedFields" multiple="multiple" size={displaySize}>
                        {this.unmatchedFields.map(item => {
                            return <option key={item.strName}>{item.strName}</option>;
                        })}
                    </select>
                </div>
                <div className='SectionMargin'>
                    <div>Add sorted field manually</div>
                    <div style={{display:'flex',flexDirection:'row'}}>
                        <button onClick={this.addSortedManually}>+</button>
                        <input id='NewSortedText' style={{flex: 1}} type='text' onKeyUp={this.textboxEnterKeyHandler} />
                        <label><input id='NewSortedIsPattern' type='checkbox' />regex pattern?</label>
                    </div>
                    <div style={{visibility: this.addErrorVisibility, color: 'red'}} >A value must be provided</div>
                </div>
                <div className='SectionMargin'>
                    <div>Sorted fields</div>
                    <button className="CoreButton EndButton" type="button" onClick={this.selectAllSorted} >All</button>
                    <button className="CoreButton MiddleButton" type="button" onClick={this.selectNoneSorted} >None</button>
                    <button className="CoreButton EndButton" type="button" onClick={this.deleteSorted} >Delete Selected</button>
                </div>
                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Droppable droppableId="droppable">
                        {(droppableProvided, droppableSnapshot) => (
                            <div className='SortedFields'
                                ref={droppableProvided.innerRef}
                            >
                                {window.FieldSorter.sortedFields.map((item, index) => (
                                    <Draggable key={item.text} draggableId={item.text} index={index}>
                                        {(draggableProvided, draggableSnapshot) => (
                                            <div
                                                ref={draggableProvided.innerRef}
                                                {...draggableProvided.draggableProps}
                                                {...draggableProvided.dragHandleProps}
                                            >
                                                <SortRow key={index} sortField={item} />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {droppableProvided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        );
    }
}

class SortRow extends Component {
    constructor(props) {
        super(props);
        this.isPatternChanged = this.isPatternChanged.bind(this);
        this.textChanged = this.textChanged.bind(this);
        this.selectionChanged = this.selectionChanged.bind(this);
    }

    isPatternChanged() {
        this.props.sortField.isPattern = !this.props.sortField.isPattern;
        this.forceUpdate();
    }

    textChanged(event) {
        this.props.sortField.text = event.target.value;
        this.forceUpdate();
    }

    selectionChanged() {
        this.props.sortField.selected = !this.props.sortField.selected;
        this.forceUpdate();
    }

    render(){
        return <div className="SortedField" style={{backgroundColor: this.props.sortField.selected ? 'lightblue' : 'white'}} >
            <DragHandleIcon onClick={this.selectionChanged} />
            <div onClick={this.isPatternChanged} className='SortFieldCell IsPatternIndicator'>{this.props.sortField.isPattern ? '(.)*' : ''}</div>
            <div className='SortFieldCell SortFieldText' >{this.props.sortField.text}</div>
        </div>
    }
}

class DragHandleIcon extends Component {
    render() {
        return <svg onClick={this.props.onClick} className="GrabHandle SortFieldCell" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" d="M0 0h24v24H0V0z"/>
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>;
    }
}

export default App;
