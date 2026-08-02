import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface PaywallCheckRequest {
  articleId: string;
  userId?: string;
}

interface PaywallCheckResponse {
  hasAccess: boolean;
  reason: 'free' | 'subscribed' | 'not_subscribed' | 'not_authenticated';
  freeLines?: number;
  totalLines?: number;
}

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { articleId, userId }: PaywallCheckRequest = await req.json();

    if (!articleId) {
      return new Response(
        JSON.stringify({ error: 'articleId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch article details
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, isPremium, freeLines, content')
      .eq('id', articleId)
      .eq('status', 'published')
      .single();

    if (articleError || !article) {
      return new Response(
        JSON.stringify({ error: 'Article not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If article is not premium, everyone has access
    if (!article.isPremium) {
      const response: PaywallCheckResponse = {
        hasAccess: true,
        reason: 'free',
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If user is not authenticated, no access to premium content
    if (!userId) {
      const totalLines = article.content.split('\n').length;
      const response: PaywallCheckResponse = {
        hasAccess: false,
        reason: 'not_authenticated',
        freeLines: article.freeLines || 12,
        totalLines,
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user has active subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'active')
      .gte('endDate', new Date().toISOString())
      .single();

    if (subscriptionError || !subscription) {
      const totalLines = article.content.split('\n').length;
      const response: PaywallCheckResponse = {
        hasAccess: false,
        reason: 'not_subscribed',
        freeLines: article.freeLines || 12,
        totalLines,
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // User has active subscription, grant access
    const response: PaywallCheckResponse = {
      hasAccess: true,
      reason: 'subscribed',
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
