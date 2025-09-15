// In handleForgotPassword function
const handleForgotPassword = async (e) => {
  e.preventDefault();
  setResetLoading(true);
  setError('');
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      // Use auth-handler route to process the tokens
      redirectTo: `${window.location.origin}/admin/auth-handler`,
    });
    
    if (error) {
      throw error;
    }
    
    setResetSuccess(true);
  } catch (err) {
    setError(err.message || 'Failed to send reset email');
  } finally {
    setResetLoading(false);
  }
};
