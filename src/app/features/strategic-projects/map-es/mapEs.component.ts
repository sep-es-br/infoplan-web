import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IStrategicProjectFilterValuesDto } from '../../../core/interfaces/strategic-project-filter.interface';
import { IIdAndName } from '../../../core/interfaces/id-and-name.interface';
import { Region } from '../../../core/interfaces/map-es.interface';

@Component({
  selector: 'ngx-map-es',
  styleUrls: ['./mapEs.component.scss'],
  template: `
    <div class="container">
      <div class="legenda">
        <div *ngFor="let regiao of regioesArray" class="legenda-item">
          <span class="legenda-cor" [style.background-color]="regiao.cor" [style.opacity]="getOpacidadeLegenda(regiao.nome)" (click)="aplicarCorRegiao(regiao)"></span>
          <span class="legenda-texto" (click)="aplicarCorRegiao(regiao)" [style.font-weight]="getFontWeightBasedOnRegionActivity(regiao.nome)">{{ regiao.nome }}</span>
        </div>
      </div>
      <div class="mapa-es" [innerHTML]="svgSeguro"></div>
    </div>
  `,
})
export class MapEsComponent implements OnInit, OnChanges {

  @Input() filter!: any;
  @Input() localidadeList!: IIdAndName[];
  @Output() filterChange = new EventEmitter<any>();

  regioes = {
    Todas_as_Localidades: '#AAAAAA',
    Todo_o_Estado: '#4EA3BB',
    Metropolitana: '#FFAA00', // Região Metropolitana da Grande Vitória
    Central_Serrana: '#0477BF', // Central Serrana
    Sudoeste_Serrana: '#FF6B1A', // Sudoeste Serrana
    Litoral_Sul: '#A3AB78', // Litoral Sul
    Central_Sul: '#C73838', // Centro Sul
    Caparaó: '#589A8D', // Caparaó
    Rio_Doce: '#026E5B', // Rio Doce
    Centro_Oeste: '#A36717', // Centro-Oeste
    Nordeste: '#B33F00', // Nordeste
    Noroeste: '#6A33AB', // Noroeste
  };

  regioesArray = Object.keys(this.regioes).map((nome) => {
    const nomeComEspacos = nome.replace(/_/g, ' ');
    return { nome: nomeComEspacos, cor: this.regioes[nome] };
  });

  regionCities: { [key: string]: Region } = {

    Todo_o_Estado: {
      label: 'Todo o Estado',
      active: false,
      cities: [
        { code: 'TEstado', name: 'Todo o Estado', active: false },
      ],
    },

    Metropolitana: {
      label: 'Metropolitana',
      active: false,
      cities: [
        { code: '3201308', name: 'Cariacica', active: false },
        { code: '3205002', name: 'Serra', active: false },
        { code: '3205101', name: 'Viana', active: false },
        { code: '3205309', name: 'Vitória', active: false },
        { code: '3205200', name: 'Vila Velha', active: false },
        { code: '3202207', name: 'Fundão', active: false },
        { code: '3202405', name: 'Guarapari', active: false },
      ],
    },
    Central_Serrana: {
      label: 'Central Serrana',
      active: false,
      cities: [
        { code: '3202702', name: 'Itaguaçu', active: false },
        { code: '3202900', name: 'Itarana', active: false },
        { code: '3204500', name: 'Santa Leopoldina', active: false },
        { code: '3204559', name: 'Santa Maria de Jetibá', active: false },
        { code: '3204609', name: 'Santa Teresa', active: false },
      ],
    },
    Sudoeste_Serrana: {
      label: 'Sudoeste Serrana',
      active: false,
      cities: [
        { code: '3200102', name: 'Afonso Cláudio', active: false },
        { code: '3201159', name: 'Brejetuba', active: false },
        { code: '3201704', name: 'Conceição do Castelo', active: false },
        { code: '3201902', name: 'Domingos Martins', active: false },
        { code: '3203163', name: 'Laranja da Terra', active: false },
        { code: '3203346', name: 'Marechal Floriano', active: false },
        { code: '3205069', name: 'Venda Nova do Imigrante', active: false },
      ],
    },
    Litoral_Sul: {
      label: 'Litoral Sul',
      active: false,
      cities: [
        { code: '3200300', name: 'Alfredo Chaves', active: false },
        { code: '3200409', name: 'Anchieta', active: false },
        { code: '3202603', name: 'Iconha', active: false },
        { code: '3204203', name: 'Piúma', active: false },
        { code: '3202801', name: 'Itapemirim', active: false },
        { code: '3204401', name: 'Rio Novo do Sul', active: false },
        { code: '3203320', name: 'Marataízes', active: false },
        { code: '3204302', name: 'Presidente Kennedy', active: false },
      ],
    },
    Central_Sul: {
      label: 'Central Sul',
      active: false,
      cities: [
        { code: '3201209', name: 'Cachoeiro de Itapemirim', active: false },
        { code: '3205036', name: 'Vargem Alta', active: false },
        { code: '3201407', name: 'Castelo', active: false },
        { code: '3200706', name: 'Atílio Vivacqua', active: false },
        { code: '3203403', name: 'Mimoso do Sul', active: false },
        { code: '3203809', name: 'Muqui', active: false },
        { code: '3200508', name: 'Apiacá', active: false },
      ],
    },
    Caparaó: {
      label: 'Caparaó',
      active: false,
      cities: [
        { code: '3203106', name: 'Jerônimo Monteiro', active: false },
        { code: '3201803', name: 'Divino de São Lourenço', active: false },
        { code: '3202009', name: 'Dores do Rio Preto', active: false },
        { code: '3202306', name: 'Guaçuí', active: false },
        { code: '3202553', name: 'Ibitirama', active: false },
        { code: '3203700', name: 'Muniz Freire', active: false },
        { code: '3202652', name: 'Irupi', active: false },
        { code: '3204807', name: 'São José do Calçado', active: false },
        { code: '3200201', name: 'Alegre', active: false },
        { code: '3201100', name: 'Bom Jesus do Norte', active: false },
        { code: '3203007', name: 'Iúna', active: false },
        { code: '3202454', name: 'Ibatiba', active: false },
      ],
    },
    Rio_Doce: {
      label: 'Rio Doce',
      active: false,
      cities: [
        { code: '3200607', name: 'Aracruz', active: false },
        { code: '3202504', name: 'Ibiraçu', active: false },
        { code: '3203130', name: 'João Neiva', active: false },
        { code: '3203205', name: 'Linhares', active: false },
        { code: '3204351', name: 'Rio Bananal', active: false },
        { code: '3205010', name: 'Sooretama', active: false },
      ],
    },
    Centro_Oeste: {
      label: 'Centro Oeste',
      active: false,
      cities: [
        { code: '3200359', name: 'Alto Rio Novo', active: false },
        { code: '3200805', name: 'Baixo Guandú', active: false },
        { code: '3201506', name: 'Colatina', active: false },
        { code: '3204005', name: 'Pancas', active: false },
        { code: '3202256', name: 'Governador Lindenberg', active: false },
        { code: '3203353', name: 'Marilândia', active: false },
        { code: '3204658', name: 'São Domingos do Norte', active: false },
        { code: '3204708', name: 'São Gabriel da Palha', active: false },
        { code: '3205176', name: 'Vila Valério', active: false },
        { code: '3204955', name: 'São Roque do Canaã', active: false },
      ],
    },
    Nordeste: {
      label: 'Nordeste',
      active: false,
      cities: [
        { code: '3201605', name: 'Conceição da Barra', active: false },
        { code: '3204054', name: 'Pedro Canário', active: false },
        { code: '3204906', name: 'São Mateus', active: false },
        { code: '3203502', name: 'Montanha', active: false },
        { code: '3203601', name: 'Mucurici', active: false },
        { code: '3204104', name: 'Pinheiros', active: false },
        { code: '3204252', name: 'Ponto Belo', active: false },
        { code: '3203056', name: 'Jaguaré', active: false },
        { code: '3201001', name: 'Boa Esperança', active: false },
      ],
    },
    Noroeste: {
      label: 'Noroeste',
      active: false,
      cities: [
        { code: '3200169', name: 'Água Doce do Norte', active: false },
        { code: '3200904', name: 'Barra de São Francisco', active: false },
        { code: '3202108', name: 'Ecoporanga', active: false },
        { code: '3203304', name: 'Mantenópolis', active: false },
        { code: '3205150', name: 'Vila Pavão', active: false },
        { code: '3200136', name: 'Águia Branca', active: false },
        { code: '3203908', name: 'Nova Venécia', active: false },
      ],
    },
  };

  svgSeguro: SafeHtml;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.carregarSvg();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.filter) {
      this.atualizarEstadosComBaseNoFilter();
    }
  }

  carregarSvg(): void {
    this.http.get('/assets/images/app/mapa-es.svg', { responseType: 'text' }).subscribe(
      (svg: string) => {
        const svgColorido = this.aplicarCores(svg);
        this.svgSeguro = this.sanitizer.bypassSecurityTrustHtml(svgColorido);
        this.adicionarEfeitos();
        this.verificarSvgRenderizado()
      },
      (error) => {
        console.error('Erro ao carregar o SVG:', error);
      },
    );
  }

  verificarSvgRenderizado(): void {
    const intervalo = 100;
    const tempoMaximo = 5000;

    const inicio = Date.now();

    const loop = () => {
      const svgElement = document.querySelector('.mapa-es svg');

      if (svgElement) {
        this.atualizarEstadosComBaseNoFilter();
      } else if (Date.now() - inicio < tempoMaximo) {
        setTimeout(loop, intervalo);
      } else {
        console.warn('O SVG não foi renderizado dentro do tempo esperado.');
      }
    };

    loop();
  }

  atualizarEstadosComBaseNoFilter(): void {
    const svgElement = document.querySelector('.mapa-es svg');
    if (!svgElement) return;
    console.log(this.regionCities)

    Object.values(this.regionCities).forEach((region) => {
      region.active = false;
      region.cities.forEach((city) => {
        city.active = false;
      });
    });
    if (this.filter.localidades) {
      const localidade = this.localidadeList.find(
        (item) => item.id.toString() === this.filter.localidades.toString()
      );

      if (localidade) {
        Object.values(this.regionCities).forEach((region) => {
          if (region.label === localidade.name) {
            region.active = true;
            region.cities.forEach((city) => {
              city.active = true;
            });
          } else {
            const city = region.cities.find((city) => city.name === localidade.name);
            if (city) {
              city.active = true;
            }
          }
        });
      }
    }
    const paths = svgElement.querySelectorAll('path');
    paths.forEach((path: SVGPathElement) => {
      const pathId = path.getAttribute('id');
      const grupoCorrespondente = svgElement.querySelector(`g[id="${pathId}"]`) as SVGGElement | null;
      const textoDiretoCorrespondente = svgElement.querySelector(`text[id="${pathId}"]`) as SVGTextElement | null;
      const municipio = Object.values(this.regionCities)
        .flatMap((region) => region.cities)
        .find((city) => city.code === pathId);

      if (municipio) {
        path.setAttribute('fill-opacity', municipio.active ? '1' : '0.4980');

        if (grupoCorrespondente) {
          grupoCorrespondente.classList.toggle('hover-effect', municipio.active);
        }

        if (textoDiretoCorrespondente) {
          textoDiretoCorrespondente.style.fontWeight = municipio.active ? 'bold' : 'normal';
        }
      }
    });
  }

  aplicarCores(svg: string): string {
    Object.keys(this.regionCities).forEach((regionKey) => {
      const region = this.regionCities[regionKey];
      const color = this.regioes[regionKey];

      region.cities.forEach((city) => {
        svg = svg.replace(
          `id="${city.code}"`,
          `id="${city.code}" fill="${color}"`
        );
      });
    });

    return svg;
  }

  adicionarEfeitos(): void {
    setTimeout(() => {
      const svgElement = document.querySelector('.mapa-es svg');
      if (svgElement) {
        const paths = svgElement.querySelectorAll('path');

        paths.forEach((path: SVGPathElement) => {
          const pathId = path.getAttribute('id');
          const municipio = Object.values(this.regionCities)
            .flatMap((region) => region.cities)
            .find((city) => city.code === pathId);

          if (municipio) {
            path.setAttribute('fill-opacity', municipio.active ? '1' : '0.4980');
          }

          const grupoCorrespondente = svgElement.querySelector(`g[id="${pathId}"]`) as SVGGElement | null;
          const textoDiretoCorrespondente = svgElement.querySelector(`text[id="${pathId}"]`) as SVGTextElement | null;

          path.style.cursor = 'pointer';
          path.style.transition = 'fill-opacity 0.3s ease';

          const toggleAtivo = () => {
            const estavaAtivo = municipio.active;
            municipio.active = !estavaAtivo;
            const region = Object.values(this.regionCities).find((region) =>
              region.cities.some((city) => city.code === pathId)
            );

            if (region.active) {
              if(!(region.label === 'Todo o Estado')){
                municipio.active = region.active;
              }
            }

            const localidade = this.localidadeList.find(
              (item) => item.name === municipio.name
            );

            if (localidade) {
              if (municipio.active) {
                this.filter.localidades = localidade.id;
              } else {
                this.filter.localidades = '';
              }
              this.filterChange.emit(this.filter);
            }
          };

          path.addEventListener('click', toggleAtivo);

          path.addEventListener('mouseenter', () => {
            if (!municipio.active) {
              path.setAttribute('fill-opacity', '1');
              if (grupoCorrespondente) {
                grupoCorrespondente.classList.add('hover-effect');
              }
              if (textoDiretoCorrespondente) {
                textoDiretoCorrespondente.style.fontWeight = 'bold';
              }
            }
          });

          path.addEventListener('mouseleave', () => {
            if (!municipio.active) {
              path.setAttribute('fill-opacity', '0.4980');
              if (grupoCorrespondente) {
                grupoCorrespondente.classList.remove('hover-effect');
              }
              if (textoDiretoCorrespondente) {
                textoDiretoCorrespondente.style.fontWeight = 'normal';
              }
            }
          });


          if (grupoCorrespondente) {
            grupoCorrespondente.style.cursor = 'pointer';

            grupoCorrespondente.addEventListener('mouseenter', () => {
              if (!municipio.active) {
                path.setAttribute('fill-opacity', '1');
                grupoCorrespondente.classList.add('hover-effect');
              }
            });

            grupoCorrespondente.addEventListener('mouseleave', () => {
              if (!municipio.active) {
                path.setAttribute('fill-opacity', '0.4980');
                grupoCorrespondente.classList.remove('hover-effect');
              }
            });

            grupoCorrespondente.addEventListener('click', toggleAtivo);
          }


          if (textoDiretoCorrespondente) {
            textoDiretoCorrespondente.style.cursor = 'pointer';

            textoDiretoCorrespondente.addEventListener('mouseenter', () => {
              if (!municipio.active) {
                path.setAttribute('fill-opacity', '1');
                textoDiretoCorrespondente.style.fontWeight = 'bold';
              }
            });

            textoDiretoCorrespondente.addEventListener('mouseleave', () => {
              if (!municipio.active) {
                path.setAttribute('fill-opacity', '0.4980');
                textoDiretoCorrespondente.style.fontWeight = 'normal';
              }
            });

            textoDiretoCorrespondente.addEventListener('click', toggleAtivo);
          }
        });
      }
    }, 0);
  }

  aplicarCorRegiao(regiao: { nome: string }): void {
    const svgElement = document.querySelector('.mapa-es svg');
    if (!svgElement) return;

    const regiaoNomeFormatado = regiao.nome.replace(/_/g, ' ');

    const regiaoAtiva = Object.values(this.regionCities).some(
      (region) => region.label === regiaoNomeFormatado && region.active
    );


    if (regiaoAtiva) {
      this.filter.localidades = '';
      this.filterChange.emit(this.filter);
      return;
    }

    if (regiaoNomeFormatado === 'Todas as Localidades') {
      this.filter.localidades = '';
      this.filterChange.emit(this.filter);
      return;
    }

    if (regiaoNomeFormatado === 'Todo o Estado') {
      const pathEstado = svgElement.querySelector(`path[id="TEstado"]`) as SVGPathElement | null;
      if (pathEstado) {
        const estado = this.regionCities['Todo_o_Estado'];
        if (estado) {
          estado.active = !estado.active;
          estado.cities[0].active = estado.active;
          const localidade = this.localidadeList.find(
            (item) => item.name === estado.label
          );

          if (localidade) {
            this.filter.localidades = localidade.id;
            this.filterChange.emit(this.filter);
          }
        }
      }
      return;
    }

    Object.keys(this.regionCities).forEach((regionKey) => {
      const region = this.regionCities[regionKey];
      if (region.label === regiaoNomeFormatado) {
        region.active = !region.active;
        region.cities.forEach((city) => {
          city.active = region.active;
        });
        const localidade = this.localidadeList.find(
          (item) => item.name === region.label
        );

        if (localidade) {
          this.filter.localidades = localidade.id;
          this.filterChange.emit(this.filter);
        }
      }
    });

  }

  getOpacidadeLegenda(nomeRegiao: string): number {
    if (nomeRegiao === 'Todas as Localidades' && this.filter.localidades === "") {
      return 1; 
    }

    const regiaoFormatada = nomeRegiao.replace(/\s/g, '_');

    const regiao = Object.values(this.regionCities).find(
      (region) => region.label.replace(/\s/g, '_') === regiaoFormatada
    );

    if (!regiao) {
      return 0.4980;
    }
    const todasAtivas = regiao.cities.every((city) => city.active);

    return todasAtivas ? 1 : 0.4980;
  }

  getFontWeightBasedOnRegionActivity(nomeRegiao: string): string {
    if (nomeRegiao === 'Todas as Localidades' && this.filter.localidades === "") {
      return "bold"; 
    }

    const regiaoFormatada = nomeRegiao.replace(/\s/g, '_');

    const regiao = Object.values(this.regionCities).find(
      (region) => region.label.replace(/\s/g, '_') === regiaoFormatada
    );

    if (!regiao) {
      return "normal";
    }
    const todasAtivas = regiao.cities.every((city) => city.active);

    return todasAtivas ? "bold" : "normal";
  }
}