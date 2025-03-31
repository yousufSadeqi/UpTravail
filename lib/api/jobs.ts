import { supabase } from '@/lib/supabase';

export async function createJob(jobData: any) {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No authenticated session');

    // First, upload any attachments
    const attachmentUrls = await Promise.all(
      jobData.attachments.map(async (file: File) => {
        const fileExt = file.name.split('.').pop();
        // Create a more unique filename using timestamp and random string
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`; // Simplified path structure

        try {
          // Upload the file
          const { error: uploadError } = await supabase.storage
            .from('jobs') // Make sure this matches your bucket name
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('jobs')
            .getPublicUrl(filePath);

          return publicUrl;
        } catch (error: any) {
          console.error('File upload error:', error);
          throw new Error(`Failed to upload file ${file.name}: ${error.message}`);
        }
      })
    );

    // Then create the job record
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        client_id: session.user.id,
        title: jobData.title,
        category: jobData.category,
        subcategory: jobData.subcategory,
        description: jobData.description,
        budget_type: jobData.budget_type,
        budget_amount: parseFloat(jobData.budget_amount),
        location: jobData.location,
        required_skills: jobData.required_skills,
        attachments: attachmentUrls,
        timeline: jobData.timeline,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error creating job:', error);
    return { 
      data: null, 
      error: error.message || 'Failed to create job' 
    };
  }
}