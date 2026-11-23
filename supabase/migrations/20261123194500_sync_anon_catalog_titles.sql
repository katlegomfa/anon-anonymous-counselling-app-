-- Keep public catalogue titles in exact sync with the backend's validated 17-topic list.
update public.service_catalog set title = case slug
  when 'depression-therapy' then 'Depression support'
  when 'ocd-therapy' then 'OCD support'
  when 'anxiety-therapy' then 'Anxiety support'
  when 'mens-therapy' then 'Men''s wellbeing'
  when 'self-esteem-therapy' then 'Self-esteem support'
  when 'lgbtqia-therapy' then 'LGBTQIA+ affirming support'
  when 'mental-health-tests' then 'Mental-health assessments'
  when 'gambling-addiction' then 'Gambling-harm support'
  when 'veterans-support' then 'Veterans'' support'
  when 'relationship-therapy' then 'Relationship therapy (CBT, emotion-focused and communication approaches)'
  else title
end
where slug in ('depression-therapy','ocd-therapy','anxiety-therapy','mens-therapy','self-esteem-therapy','lgbtqia-therapy','mental-health-tests','gambling-addiction','veterans-support','relationship-therapy');
