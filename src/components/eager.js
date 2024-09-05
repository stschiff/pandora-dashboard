import {FileAttachment} from "npm:@observablehq/stdlib";
import * as aq from "npm:arquero";

function clean_eager_sample(sample_string) {
    if(sample_string.length == 6)
        return sample_string;
    if(sample_string.substr(6, 3) == "_ss") {
        if(sample_string.length == 9)
            return sample_string.substr(0, 6);
        else {
            return sample_string.substr(0, 6) + sample_string.substr(9);
        }
    }
    else {
        return sample_string;
    }
}

export async function loadEagerTable() {
    const eager = await FileAttachment("../data/eager.tsv").zip();
    const eagerTables = await Promise.all(eager.filenames.map(async fn => {
        const batchName = fn.split("/")[6];
        const tab = await eager.file(fn).tsv({ typed: true });
        return tab.map(row => ({
            batch_name:                batchName,
            sample:                    row.Sample,
            sample_clean:              clean_eager_sample(row.Sample),
            single_stranded:           row.Sample.substr(6, 3) == "_ss",
            total_reads:               row["Samtools Flagstat (pre-samtools filter)_mqc-generalstats-samtools_flagstat_pre_samtools_filter-flagstat_total"],
            mapped_reads:              row["Samtools Flagstat (pre-samtools filter)_mqc-generalstats-samtools_flagstat_pre_samtools_filter-mapped_passed"],
            mapped_reads_post:         row["Samtools Flagstat (post-samtools filter)_mqc-generalstats-samtools_flagstat_post_samtools_filter-mapped_passed"],
            endog_endorspy:            row["endorSpy_mqc-generalstats-endorspy-endogenous_dna"],
            endog_endorspy_post:       row["endorSpy_mqc-generalstats-endorspy-endogenous_dna_post"],
            mean_coverage:             row["QualiMap_mqc-generalstats-qualimap-mean_coverage"],
            damage_5p1:                row["DamageProfiler_mqc-generalstats-damageprofiler-5_Prime1"],
            damage_5p2:                row["DamageProfiler_mqc-generalstats-damageprofiler-5_Prime2"],
            damage_3p1:                row["DamageProfiler_mqc-generalstats-damageprofiler-3_Prime1"],
            damage_3p2:                row["DamageProfiler_mqc-generalstats-damageprofiler-3_Prime2"],
            mean_read_length:          row["DamageProfiler_mqc-generalstats-damageprofiler-mean_readlength"],
            nr_snps_covered:           row["snp_coverage_mqc-generalstats-snp_coverage-Covered_Snps"],
            contam:                    row["nuclear_contamination_mqc-generalstats-nuclear_contamination-Method1_MOM_estimate"],
            contam_err:                row["nuclear_contamination_mqc-generalstats-nuclear_contamination-Method1_MOM_SE"],
            fastqc_preTrim_total_seq:  row["FastQC (pre-Trimming)_mqc-generalstats-fastqc_pre_trimming-total_sequences"],
            fastqc_postTrim_total_seq: row["FastQC (post-Trimming)_mqc-generalstats-fastqc_post_trimming-total_sequences"],
            percent_duplicates:        row["Picard_mqc-generalstats-picard-PERCENT_DUPLICATION"],
            xrate:                     row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateX"],
            yrate:                     row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateY"],
            xrateErr:                  row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateErrX"],
            yrateErr:                  row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateErrY"],
        }));
    }));
    return eagerTables.reduce((acc, curr) => acc.concat(curr), []);
}

export async function loadEagerTableStrandCombined() {
    const eager_ds = await loadEagerTable().then(t => aq.from(t).filter(row => !row.single_stranded));
    const eager_ss = await loadEagerTable().then(t => aq.from(t).filter(row => row.single_stranded));
    return eager_ds
        .join_full(eager_ss, "sample", null, { suffix: ["_ds", "_ss"] })
        .filter(row => row.sample.length == 6)
        .derive({ stranded : row => {
            if(row.nr_snps_covered_ds != null && row.nr_snps_covered_ds != null) {
                if(row.nr_snps_covered_ds > row.nr_snps_covered_ss) {
                    return "DS*";
                } else {
                    return "SS*";
                }
            }
            else if(row.nr_snps_covered_ds != null) {
                return "DS";
            } else if(row.nr_snps_covered_ss != null) {
                return "SS";
            } else {
                return null;
            }
        }})
        .objects()
        .map(row => {
            const ret_object = {};
            for (const key in row) {
                if(key == "sample" || key == "stranded") {
                    ret_object[key] = row[key];
                }
                if(row.stranded.substr(0, 2) == "SS") {
                    if(key.substr(key.length - 3, 3) == "_ss") {
                        ret_object[key.substr(0, key.length - 3)] = row[key];
                    }
                }
                else if(row.stranded.substr(0, 2) == "DS") {
                    if(key.substr(key.length - 3, 3) == "_ds") {
                        ret_object[key.substr(0, key.length - 3)] = row[key];
                    }
                }
            }
            return ret_object;
        });
}

export async function loadEagerTableRaw() {
    const eager = await FileAttachment("../data/eager.tsv").zip();
    const eagerTables = await Promise.all(eager.filenames.map(async fn => {
        const batchName = fn.split("/")[6];
        const tab = await eager.file(fn).tsv({ typed: true });
        return tab.map(row => {
            row.batch_name = batchName;
            return row;
        });
    }));
    return eagerTables.reduce((acc, curr) => acc.concat(curr), []);
}