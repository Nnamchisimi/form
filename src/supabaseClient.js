import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://urtmleicijluwonalidr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydG1sZWljaWpsdXdvbmFsaWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNTQ5ODUsImV4cCI6MjEwMzkzMDk4NX0.RzE153tJE8MbFfquLyUGwAzPS_lmHdu8_1W-eHNwBdI'


export const supabase = createClient(supabaseUrl, supabaseKey)
