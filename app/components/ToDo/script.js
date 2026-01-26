import { supabase } from "../../../src/lib/supabase";

export async function updateTodo(id, state){
    const {data, error} = await supabase
        .from('todos')
        .update({ iscompleted: state })
        .eq('id', id)
        .select();

        if(error){
            console.error("Error updating todo:", error);
            return null;
        }
        return data;
}

export async function deleteTodo(id, refresh){
    const {data, error} = await supabase
        .from('todos')
        .delete()
        .eq('id', id);
    if(error){
        console.error("Error deleting todo:", error);
        return null;
    }
    refresh();
    return data;
}

export async function addTodo(id, description, priority, date, refresh){
    if(description == "" || priority == "none"){
        return null;
    }
    const {data, error} = await supabase
        .from('todos')
        .insert([{ id: id, description: description, priority: priority, created_at: date }])
        .select()

        if(error){
            console.error("Error adding todo:", error);
            return null;
        }
        refresh();
        return data;
}