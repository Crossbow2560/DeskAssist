import { supabase } from "../../src/lib/supabase";

export async function fetchTodos() {
    const {data, error} = await supabase
        .from('todos')
        .select('*');

    if (error) {
        console.error("Error fetching todos:", error);
        return [];
    }
    return data;
};