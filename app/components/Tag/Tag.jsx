import styles from "./Tag.module.css";

export default function Tag({priority}){
    var priorityClass = "";
    var tagText = "";

    if (priority === "none"){
        priorityClass = styles.none;
        tagText = "Select";
    } else if(priority === "high"){
        priorityClass = styles.high;
        tagText = "Focus";
    } else if (priority === "medium"){
        priorityClass = styles.medium;
        tagText = "Steady";
    } else if (priority === "low"){
        priorityClass = styles.low;
        tagText = "Chill";
    }

    return(
        <div className={`${styles.tag} ${priorityClass}`}>
            {tagText}
        </div>
    )
}