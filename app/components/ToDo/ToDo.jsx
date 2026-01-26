"use client";

import { useState } from 'react';

import styles from "./ToDo.module.css";
import Tag from "../Tag/Tag.jsx";

import { updateTodo, deleteTodo, addTodo } from './script.js';

export default function ToDo({ id, isCompleted, description, priority, date, refresh}){
    const [descriptionText, setDescriptionText] = useState(description);
    const [priorityLevel, setPriorityLevel] = useState(priority);
    const [showPrioritySelect, setShowPrioritySelect] = useState(false);


    const [completed, setCompleted] = useState(isCompleted);
    let checkbox;
    if(completed){
        checkbox = <img src="/images/checkbox-ticked.svg" className={styles.checkboxImage} />;
    } else {
        checkbox = <img src="/images/checkbox-empty.svg" className={styles.checkboxImage} />;
    }

    function handlePriorityChange(newPriority) {
      setPriorityLevel(newPriority);
      setShowPrioritySelect(false);
    }


    if(description == "" && priority == "none"){
        return (
            <>
            <main className={styles.todo}>
            <img src="/images/trashcan.svg" className={styles.trashcan} onClick={() => deleteTodo(id, refresh)}/>
            <img src="/images/add.svg" className={styles.add} onClick={() => addTodo(id, descriptionText, priorityLevel, date, refresh)}/>
            <div className={styles.descriptionNotext}>
                <input 
                    type="text" 
                    className={styles.input}
                    value={descriptionText}
                    onChange={(e) => setDescriptionText(e.target.value)}
                    placeholder="Enter Your To Do"
                />
            </div>
            <div 
              className={styles.priorityTag}
              onClick={() => setShowPrioritySelect(!showPrioritySelect)}
            >
              {!showPrioritySelect && <Tag priority={priorityLevel}/>}
            </div>
            {showPrioritySelect && (
              <div className={styles.prioritySelect}>
                <div 
                  className={styles.priorityOption}
                  onClick={() => handlePriorityChange("low")}
                >
                  <Tag priority="low"/>
                </div>
                <div 
                  className={styles.priorityOption}
                  onClick={() => handlePriorityChange("medium")}
                >
                    <Tag priority="medium"/>
                </div>
                <div 
                  className={styles.priorityOption}
                  onClick={() => handlePriorityChange("high")}
                >
                  <Tag priority="high"/>
                </div>
              </div>
            )}

            <div className={styles.date}>
                {date ? date.split('T')[0] : 'No date'}
            </div>
        </main>
        </>
        );
    }
    return(
        <main className={styles.todo}>
            {completed && <img src="/images/trashcan.svg" className={styles.trashcan} onClick={() => deleteTodo(id, refresh)}/>}
            <div className={styles.checkbox} onClick={() => {
                setCompleted(!completed);
                updateTodo(id, !completed);
            }}>
                {checkbox}
            </div>
            <div className={styles.description}>
                {description}
            </div>
            
            <div 
              className={styles.priorityTag}
            >
              <Tag priority={priorityLevel}/>
            </div>
            <div className={styles.date}>
                {date ? date.split('T')[0] : 'No date'}
            </div>
        </main>
    )
}
