from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vocabulary', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='word',
            name='origin_language',
            field=models.CharField(blank=True, max_length=120),
        ),
    ]
