#!/usr/bin/env bash

rsync -ruvR --delete daghead1:/mnt/archgen/MICROSCOPE/eager_outputs/*/multiqc/multiqc_data/*general_stats.txt /tmp/eager
zip - /tmp/eager/mnt/archgen/MICROSCOPE/eager_outputs/*/multiqc/multiqc_data/*general_stats.txt
