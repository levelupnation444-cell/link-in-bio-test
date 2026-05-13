"use client";

import Script from "next/script";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

export function PostHog() {
  if (!POSTHOG_KEY) return null;

  return (
    <Script id="posthog-init" strategy="afterInteractive">
      {`
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session alias set_config reset opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug get_distinct_id identify set_person_properties get_session_replay_url start_session_recording stop_session_recording capture "$snapshot" "$identify" "$groupidentify" "$set" "$set_once" "$unset" "$add" "$append" "$remove" "$merge" "$create_alias" "$person_set" "$person_set_once" "$person_unset" "$person_append" "$person_remove" "$person_merge" group set_group remove_group track_pageview capture_pageview".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('${POSTHOG_KEY}', {
          api_host: '${POSTHOG_HOST}',
          capture_pageview: 'history_change'
        });
      `}
    </Script>
  );
}
