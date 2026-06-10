namespace TourPackages.Api.PasswordResetOtp;

/// <summary>
/// Builds the password-reset email subject/body. Centralised so both the SMTP
/// and logging senders produce identical wording. Net-new, additive.
/// </summary>
public static class OtpEmailContent
{
    public const string Subject = "Your Wanderlust Tours password reset code";

    public static string Body(string username, string otp) =>
        $"""
        Hi {username},

        We received a request to reset the password for your Wanderlust Tours account.

        Your one-time verification code is: {otp}

        This code is valid for 5 minutes only. For your security, please don't share
        it with anyone. If you didn't request a password reset, you can safely ignore
        this email — your password will stay the same.

        Happy travels,
        The Wanderlust Tours Team
        """;
}
