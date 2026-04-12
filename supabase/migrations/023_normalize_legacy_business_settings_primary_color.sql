UPDATE public.business_settings
SET
  primary_color = '#0f9b9b',
  text_color = CASE
    WHEN text_color IS NULL OR trim(text_color) = '' OR text_color !~* '^#[0-9a-f]{6}$' THEN '#000000'
    ELSE lower(trim(text_color))
  END
WHERE
  primary_color IS NULL
  OR trim(primary_color) = ''
  OR lower(trim(primary_color)) = '#ffba38'
  OR primary_color !~* '^#[0-9a-f]{6}$';
